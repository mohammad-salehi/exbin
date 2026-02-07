import React, { useEffect, useState, useMemo } from 'react';
import ExpandableTable, { Column } from "../../components/ExpandableTable/ExpandableTable";
import Pagination from "../../components/Pagination/Pagination";
import { GetRequest } from '../../functions/GetRequest';
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import SearchableSelect from "../../components/Select/Select";

type SchedulerState = {
  schedulerName: string;
  instanceName: string;
  lastCheckinTime: number;
  checkinInterval: number;
};

type TableRow = SchedulerState & {
  id: string;
};

const AdminSchedulerState = () => {
  const [schedulerStates, setSchedulerStates] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // pagination (UI 1-based)
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

  // ✅ filter
  const [schedulerSelected, setSchedulerSelected] = useState<string>('');

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setError('');

      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/scheduler-state`)
        .then((response) => {
          if (response && response.result) {
            const mapped = response.result.map((state: SchedulerState, index: number) => ({
              ...state,
              id: `${state.schedulerName}-${state.instanceName}-${index}`,
            }));
            setSchedulerStates(mapped);
            setTotal(response.result.length);
          } else {
            setError('No data found');
          }
        })
        .catch(() => setError('Failed to fetch data'))
        .finally(() => setLoading(false));
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

  // ✅ options from API data
  const schedulerOptions = useMemo(() => {
    const set = new Set<string>();
    schedulerStates.forEach(s => {
      const v = (s.schedulerName ?? '').trim();
      if (v) set.add(v);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, 'fa'))
      .map(v => ({ id: v, label: v, value: v }));
  }, [schedulerStates]);

  // ✅ local filtering
  const filteredStates = useMemo(() => {
    return schedulerStates.filter(s =>
      !schedulerSelected || s.schedulerName === schedulerSelected
    );
  }, [schedulerStates, schedulerSelected]);

  // reset to first page on filter change
  useEffect(() => {
    setPage(1);
  }, [schedulerSelected, size]);

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

  const start = (page - 1) * size;
  const pageData = filteredStates.slice(start, start + size);

  return (
    <div className="space-y-6">

      {/* ✅ Filter */}
      <div className="w-full md:w-80 text-sm text-titleText dark:text-titleText-dark">
        <SearchableSelect
          label="Scheduler Name"
          value={schedulerSelected}
          onChange={(val) => {
            setSchedulerSelected(val);
            setPage(1);
          }}
          options={schedulerOptions}
          placeholder="بدون فیلتر"
          allLabel="بدون فیلتر"
          searchable
          searchPlaceholder="جستجو..."
        />
      </div>

      <ExpandableTable<TableRow>
        columns={columns}
        data={pageData}
      />

      <Pagination
        totalItems={filteredStates.length}
        pageSize={size}
        currentPage={page}
        onPageChange={(p: number) => setPage(p)}
        onPageSizeChange={(s: number) => {
          setSize(s);
          setPage(1);
        }}
        rtl
      />
    </div>
  );
};

export default AdminSchedulerState;
