import React, { useEffect, useState, useMemo } from 'react';
import ExpandableTable, { Column } from "../../components/ExpandableTable/ExpandableTable";
import Pagination from "../../components/Pagination/Pagination";
import { GetRequest } from '../../functions/GetRequest'; // فرض می‌کنیم که این تابع قبلاً ساخته شده است
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";

type Trigger = {
  exchangeId: number;
  exchangeName: string;
  schedulerName: string;
  triggerName: string;
  triggerGroup: string;
  repeatCount: number;
  repeatInterval: number;
  timesTriggered: number;
};

type TableRow = Trigger & { // اضافه کردن id به نوع Trigger
  id: string; // می‌توانیم id را به عنوان ترکیب schedulerName و triggerName بگذاریم
};

const AdminSimpleTriggers = () => {
  const [triggers, setTriggers] = useState<TableRow[]>([]); // تغییر نوع به TableRow
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = () => {
      // ارسال درخواست به ریسورس جدید
      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/simple-triggers`)
        .then((response) => {
          if (response && response.result) {
            const mappedTriggers = response.result.map((trigger: Trigger, index: number) => ({
              ...trigger,
              id: `${trigger.schedulerName}-${trigger.triggerName}`, // ایجاد id برای هر ردیف
            }));
            setTriggers(mappedTriggers);
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

  const columns: Column<TableRow>[] = useMemo(
    () => [
      {
        header: "Scheduler Name",
        accessor: "schedulerName",
        cell: (row) => <div>{row.schedulerName}</div>,
      },
      {
        header: "Trigger Name",
        accessor: "triggerName",
        cell: (row) => <div>{row.triggerName}</div>,
      },
      {
        header: "Trigger Group",
        accessor: "triggerGroup",
        cell: (row) => <div>{row.triggerGroup}</div>,
      },
      {
        header: "Repeat Count",
        accessor: "repeatCount",
        cell: (row) => <div>{row.repeatCount}</div>,
      },
      {
        header: "Repeat Interval (ms)",
        accessor: "repeatInterval",
        cell: (row) => <div>{row.repeatInterval.toLocaleString()}</div>,
      },
      {
        header: "Times Triggered",
        accessor: "timesTriggered",
        cell: (row) => <div>{row.timesTriggered.toLocaleString()}</div>,
      },
      {
        header: "Exchange Name",
        accessor: "exchangeName",
        cell: (row) => <div>{row.exchangeName}</div>,
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
        data={triggers.slice(page * size, (page + 1) * size)}  // استفاده از slice به جای splice
      />

      <Pagination
        totalItems={total ?? triggers.length}
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

export default AdminSimpleTriggers;
