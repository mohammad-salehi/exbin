import React, { useEffect, useState, useMemo } from 'react';
import ExpandableTable, { Column } from "../../components/ExpandableTable/ExpandableTable";
import Pagination from "../../components/Pagination/Pagination";
import { GetRequest } from '../../functions/GetRequest'; // فرض می‌کنیم که این تابع قبلاً ساخته شده است
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";

type SchedulerState = {
  schedulerName: string;
  instanceName: string;
  lastCheckinTime: number;
  checkinInterval: number;
};

type TableRow = SchedulerState & { // اضافه کردن id به نوع SchedulerState
  id: string; // می‌توانیم id را به عنوان ترکیب schedulerName و instanceName بگذاریم
};

const AdminSchedulerState = () => {
  const [schedulerStates, setSchedulerStates] = useState<TableRow[]>([]); // تغییر نوع به TableRow
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = () => {
      // ارسال درخواست به ریسورس جدید
      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/scheduler-state`)
        .then((response) => {
          if (response && response.result) {
            const mappedSchedulerStates = response.result.map((state: SchedulerState, index: number) => ({
              ...state,
              id: `${state.schedulerName}-${state.instanceName}`, // ایجاد id برای هر ردیف
            }));
            setSchedulerStates(mappedSchedulerStates);
            setTotal(response.result.length); // تعداد کل داده‌ها
          } else {
            setError('No data found');
          }
        })
        .catch((err) => {
          setError('Failed to fetch data');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchData();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column<TableRow>[] = useMemo(
    () => [
      {
        header: "Scheduler Name",
        accessor: "schedulerName",
        cell: (row) => <div>{row.schedulerName}</div>,
      },
      {
        header: "Instance Name",
        accessor: "instanceName",
        cell: (row) => <div>{row.instanceName}</div>,
      },
      {
        header: "Last Check-in Time",
        accessor: "lastCheckinTime",
        cell: (row) => formatDate(row.lastCheckinTime),
      },
      {
        header: "Check-in Interval (ms)",
        accessor: "checkinInterval",
        cell: (row) => <div>{row.checkinInterval.toLocaleString()}</div>,
      },
    ],
    []
  );

  if (loading) return <div><LoadingComponent /></div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <ExpandableTable<TableRow>
        columns={columns}
        data={schedulerStates.slice(page * size, (page + 1) * size)}  // استفاده از slice به جای splice
      />

      <Pagination
        totalItems={total ?? schedulerStates.length}
        pageSize={size}
        currentPage={page + 1}
        onPageChange={(p: number) => setPage(p - 1)}
        onPageSizeChange={(s: number) => {
          setSize(s);
          setPage(0);
        }}
        rtl
      />
    </div>
  );
};

export default AdminSchedulerState;
