import React, { useEffect, useState, useMemo } from 'react';
import ExpandableTable, { Column } from "../../components/ExpandableTable/ExpandableTable";
import Pagination from "../../components/Pagination/Pagination";
import { GetRequest } from '../../functions/GetRequest';
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import SearchableSelect from "../../components/Select/Select";

type Job = {
  exchangeId: number | null;
  exchangeName: string | null;
  priority: number;
  description: string;
  schedulerName: string;
  triggerState: string;
  nextFireTime: number;
  startTime: number;
  endTime: number | null;
  triggerName: string;
  triggerGroup: string;
  jobName: string;
  jobGroup: string;
  triggerType: string;
  jobData: string;
};

type TableRow = Job & {
  id: string;
  subRows?: TableRow[];
};

const AdminSchedulers = () => {
  const [jobs, setJobs] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // pagination (matches your existing Pagination API: 1-based)
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [total, setTotal] = useState<number | null>(null);

  // ✅ filters (default: no filter)
  const [exchangeSelected, setExchangeSelected] = useState<string>('');
  const [schedulerSelected, setSchedulerSelected] = useState<string>('');

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setError('');

      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`)
        .then((response) => {
          if (response && response.result) {
            const mappedJobs = response.result.map((job: Job, index: number) => ({
              ...job,
              id: `${job.jobName}-${index}`,
              subRows: [],
            }));
            setJobs(mappedJobs);
            setTotal(response.totalElements);
          } else {
            setError('No data found');
          }
        })
        .catch(() => {
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

  // ✅ dropdown options from server results
  const exchangeOptions = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      const v = (j.exchangeName ?? '').trim();
      if (v) set.add(v);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, 'fa'))
      .map((v) => ({ id: v, label: v, value: v }));
  }, [jobs]);

  const schedulerOptions = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      const v = (j.schedulerName ?? '').trim();
      if (v) set.add(v);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, 'fa'))
      .map((v) => ({ id: v, label: v, value: v }));
  }, [jobs]);

  // ✅ local filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const okExchange = !exchangeSelected || (j.exchangeName ?? '') === exchangeSelected;
      const okScheduler = !schedulerSelected || (j.schedulerName ?? '') === schedulerSelected;
      return okExchange && okScheduler;
    });
  }, [jobs, exchangeSelected, schedulerSelected]);

  // ✅ reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [exchangeSelected, schedulerSelected, size]);

  const columns: Column<TableRow>[] = useMemo(
    () => [
      {
        header: "Exchange Name",
        accessor: "exchangeName",
        cell: (row) => <div>{row.exchangeName ?? '-'}</div>,
      },
      {
        header: "Description",
        accessor: "description",
        cell: (row) => <div>{row.description}</div>,
        maxWidth: 250,
      },
      {
        header: "Priority",
        accessor: "priority",
        cell: (row) => <div>{row.priority}</div>,
      },
      {
        header: "Scheduler",
        accessor: "schedulerName",
        cell: (row) => <div>{row.schedulerName}</div>,
      },
      {
        header: "Next Fire Time",
        accessor: "nextFireTime",
        cell: (row) => formatDate(row.nextFireTime),
      },
      {
        header: "Start Time",
        accessor: "startTime",
        cell: (row) => formatDate(row.startTime),
      },
      {
        header: "End Time",
        accessor: "endTime",
        cell: (row) => (row.endTime ? formatDate(row.endTime) : "N/A"),
      },
    ],
    []
  );

  if (loading) return <div><LoadingComponent /></div>;
  if (error) return <div>{error}</div>;

  const start = (page - 1) * size;
  const pageData = filteredJobs.slice(start, start + size);

  return (
    <div className="space-y-6">
      {/* ✅ Filters (same Select component as your other page) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="w-full text-sm text-titleText dark:text-titleText-dark">
          <SearchableSelect
            label="Exchange Name"
            value={exchangeSelected}
            onChange={(val) => {
              setExchangeSelected(val);
              setPage(1);
            }}
            options={exchangeOptions}
            placeholder="بدون فیلتر"
            allLabel="بدون فیلتر"
            searchable
            searchPlaceholder="جستجو..."
            className="w-full text-sm"
          />
        </div>

        <div className="w-full text-sm text-titleText dark:text-titleText-dark">
          <SearchableSelect
            label="Scheduler"
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
            className="w-full text-sm"
          />
        </div>
      </div>

      <ExpandableTable<TableRow>
        columns={columns}
        data={pageData}
      />

      <Pagination
        totalItems={filteredJobs.length}
        pageSize={size}
        currentPage={page}
        onPageChange={(p: number) => setPage(p)}
        rtl
      />
    </div>
  );
};

export default AdminSchedulers;
