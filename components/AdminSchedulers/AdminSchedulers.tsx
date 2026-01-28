import React, { useEffect, useState, useMemo } from 'react';
import ExpandableTable, { Column } from "../../components/ExpandableTable/ExpandableTable";
import Pagination from "../../components/Pagination/Pagination";
import { GetRequest } from '../../functions/GetRequest'; 
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";

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
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = () => {
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

    return (
        <div className="space-y-6">
            <ExpandableTable<TableRow>
                columns={columns}
                data={jobs.slice(page * size, (page + 1) * size)}
            />


            <Pagination
                totalItems={total ?? jobs.length}
                pageSize={size}
                currentPage={page + 1}
                onPageChange={(p: number) => setPage(p - 1)}
                rtl
            />
        </div>
    );
};

export default AdminSchedulers;
