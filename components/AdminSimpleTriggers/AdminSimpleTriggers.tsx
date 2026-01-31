import React, { useEffect, useState, useMemo } from 'react';
import ExpandableTable, { Column } from "../../components/ExpandableTable/ExpandableTable";
import Pagination from "../../components/Pagination/Pagination";
import { GetRequest } from '../../functions/GetRequest';
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import SearchableSelect from "../../components/Select/Select";

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

type TableRow = Trigger & {
  id: string;
};

const AdminSimpleTriggers = () => {
  const [triggers, setTriggers] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // pagination (1-based for UI)
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

  // ✅ filters
  const [schedulerSelected, setSchedulerSelected] = useState<string>('');
  const [exchangeSelected, setExchangeSelected] = useState<string>('');

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setError('');

      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/simple-triggers`)
        .then((response) => {
          if (response && response.result) {
            const mappedTriggers = response.result.map((trigger: Trigger, index: number) => ({
              ...trigger,
              id: `${trigger.schedulerName}-${trigger.triggerName}-${index}`,
            }));
            setTriggers(mappedTriggers);
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

  // ✅ dropdown options from API result
  const schedulerOptions = useMemo(() => {
    const set = new Set<string>();
    triggers.forEach(t => {
      const v = (t.schedulerName ?? '').trim();
      if (v) set.add(v);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, 'fa'))
      .map(v => ({ id: v, label: v, value: v }));
  }, [triggers]);

  const exchangeOptions = useMemo(() => {
    const set = new Set<string>();
    triggers.forEach(t => {
      const v = (t.exchangeName ?? '').trim();
      if (v) set.add(v);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, 'fa'))
      .map(v => ({ id: v, label: v, value: v }));
  }, [triggers]);

  // ✅ local filtering
  const filteredTriggers = useMemo(() => {
    return triggers.filter(t => {
      const okScheduler = !schedulerSelected || t.schedulerName === schedulerSelected;
      const okExchange = !exchangeSelected || t.exchangeName === exchangeSelected;
      return okScheduler && okExchange;
    });
  }, [triggers, schedulerSelected, exchangeSelected]);

  // reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [schedulerSelected, exchangeSelected, size]);

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

  const start = (page - 1) * size;
  const pageData = filteredTriggers.slice(start, start + size);

  return (
    <div className="space-y-6">

      {/* ✅ Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="w-full text-sm text-titleText dark:text-titleText-dark">
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
          />
        </div>
      </div>

      <ExpandableTable<TableRow>
        columns={columns}
        data={pageData}
      />

      <Pagination
        totalItems={filteredTriggers.length}
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

export default AdminSimpleTriggers;
