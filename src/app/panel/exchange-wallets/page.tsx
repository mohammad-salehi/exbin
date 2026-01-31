'use client';

import React, { useEffect, useMemo, useState } from 'react';
import RiskSwitch from '../../../../components/Dashboard/ExchangeList/Switch/Switch';
import { Button } from '@heathmont/moon-base-tw';
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent';
import ExpandableTable from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import SearchableSelect from '../../../../components/Select/Select';
import { GetRequest } from '../../../../functions/GetRequest';
import { useSearchParams } from 'next/navigation';

type WalletAddress = {
    id: string;
    address: string;
    balance: number;
    network: string;
    exchangeName: string;
};

type ApiResponse = {
    result?: {
        content?: any[];
        totalElements?: number;
        totalPages?: number;
        size?: number;
        number?: number;
    };
};

const FAKE_URL = 'https://example.com/api/wallets'; // آدرس فیک برای الان

const Page = () => {
    const sp = useSearchParams();
    
    const [loading, setLoading] = useState(false);

    // فیلترها
    const [wallets, setWallets] = useState<WalletAddress[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [exchangeSelected, setExchangeSelected] = useState<string>(sp.get('exchange') || '');
    const [networkSelected, setNetworkSelected] = useState<string>('');

    const [exchanges] = useState([
        { id: '1', name: 'Binance' },
        { id: '2', name: 'Coinbase' },
        { id: '3', name: 'Kraken' },
    ]);

    const [networks] = useState(['Ethereum', 'Bitcoin', 'Tron', 'Binance Smart Chain']);

    // دیتای فیک
    const fakeData: WalletAddress[] = useMemo(() => [
        { id: '1', address: '0x123...', balance: 2.5, network: 'Ethereum', exchangeName: 'Binance' },
        { id: '2', address: '0x456...', balance: 1.8, network: 'Bitcoin', exchangeName: 'Coinbase' },
        { id: '3', address: '0x789...', balance: 0.5, network: 'Tron', exchangeName: 'Kraken' },
        { id: '4', address: '0xabc...', balance: 0.2, network: 'Binance Smart Chain', exchangeName: 'Binance' },
        { id: '1', address: '0x123...', balance: 2.5, network: 'Ethereum', exchangeName: 'Binance' },
        { id: '2', address: '0x456...', balance: 1.8, network: 'Bitcoin', exchangeName: 'Coinbase' },
        { id: '3', address: '0x789...', balance: 0.5, network: 'Tron', exchangeName: 'Kraken' },
        { id: '4', address: '0xabc...', balance: 0.2, network: 'Binance Smart Chain', exchangeName: 'Binance' },
        { id: '1', address: '0x123...', balance: 2.5, network: 'Ethereum', exchangeName: 'Binance' },
        { id: '2', address: '0x456...', balance: 1.8, network: 'Bitcoin', exchangeName: 'Coinbase' },
        { id: '3', address: '0x789...', balance: 0.5, network: 'Tron', exchangeName: 'Kraken' },
        { id: '4', address: '0xabc...', balance: 0.2, network: 'Binance Smart Chain', exchangeName: 'Binance' },
        { id: '1', address: '0x123...', balance: 2.5, network: 'Ethereum', exchangeName: 'Binance' },
        { id: '2', address: '0x456...', balance: 1.8, network: 'Bitcoin', exchangeName: 'Coinbase' },
        { id: '3', address: '0x789...', balance: 0.5, network: 'Tron', exchangeName: 'Kraken' },
        { id: '4', address: '0xabc...', balance: 0.2, network: 'Binance Smart Chain', exchangeName: 'Binance' },
    ], []);

    // ساخت درخواست API
    const buildQueryUrl = () => {
        const params = new URLSearchParams();
        params.set('page', String(Math.max(0, currentPage - 1)));
        params.set('size', String(pageSize));

        if (exchangeSelected) params.set('exchange', exchangeSelected);
        if (networkSelected) params.set('network', networkSelected);

        return `${FAKE_URL}?${params.toString()}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // استفاده از داده فیک تا زمانی که بک‌اند آماده بشه
            const data = fakeData;
            setWallets(data);
            setTotalItems(data.length);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exchangeSelected, networkSelected, currentPage, pageSize]);

    const columns = useMemo(() => [
        {
            header: 'آدرس',
            accessorKey: 'address',
            cell: (row: WalletAddress) => <span>{row.address}</span>,
        },
        {
            header: 'موجودی',
            accessorKey: 'balance',
            cell: (row: WalletAddress) => <span>{row.balance}</span>,
        },
        {
            header: 'شبکه',
            accessorKey: 'network',
            cell: (row: WalletAddress) => <span>{row.network}</span>,
        },
        {
            header: 'نام صرافی',
            accessorKey: 'exchangeName',
            cell: (row: WalletAddress) => <span>{row.exchangeName}</span>,
        },
    ], []);

    return (
        <div className="p-2 sm:p-0">
            <div className="mt-4">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

                    <div className="order-2 lg:order-1 w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full justify-start">
                            <SearchableSelect
                                label="صرافی"
                                value={exchangeSelected}
                                onChange={setExchangeSelected}
                                options={exchanges.map((e) => ({
                                    id: e.id,
                                    label: e.name,
                                    value: e.name,
                                }))}
                                placeholder="همه صرافی‌ها"
                                allLabel="همه صرافی‌ها"
                                searchable
                                searchPlaceholder="جستجوی نام صرافی..."
                                className="sm:w-80 text-sm"
                            />
                        </div>
                    </div>

                    <div className="order-2 lg:order-1 w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full justify-start">
                            <SearchableSelect
                                label="شبکه"
                                value={networkSelected}
                                onChange={setNetworkSelected}
                                options={networks.map((network) => ({
                                    id: network,
                                    label: network,
                                    value: network,
                                }))}
                                placeholder="همه شبکه‌ها"
                                allLabel="همه شبکه‌ها"
                                searchable
                                searchPlaceholder="جستجوی نام صرافی..."
                                className="sm:w-80 text-sm"
                            />
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* جدول */}
            <div className="mt-4">
                {loading ? (
                    <LoadingComponent />
                ) : (
                    <div className="mt-4 w-full overflow-x-auto">
                        <ExpandableTable<WalletAddress>
                            data={wallets}
                            columns={columns as any}
                            rowDetailsMode="row"
                            rowDetailsClassName="rounded-xl p-3"
                        />
                    </div>
                )}

                <Pagination
                    rtl
                    totalItems={totalItems}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={(p: number) => setCurrentPage(p)}
                />
            </div>
        </div>
    );
};

export default Page;
