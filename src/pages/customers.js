import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CustomersTable } from 'src/sections/customer/customers-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import axios from 'axios';
import getConfig from 'next/config';

const useCustomers = (users, page, rowsPerPage) => {
    return useMemo(
        () => {
            return applyPagination(users, page, rowsPerPage);
        },
        [users, page, rowsPerPage]
    );
};

const useFilteredCustomers = (users, key) => {
    return useMemo(
        () => {
            return users.filter((user) => user.name.toLowerCase().includes(key.toLowerCase()))
        },
        [users, key]
    )
}

const useCustomerIds = (customers) => {
    return useMemo(
        () => {
            return customers.map((customer) => customer._id);
        },
        [customers]
    );
};

const Page = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [users, setUsers] = useState([]);
    const [searchWord, setSearchWord] = useState('');
    const { publicRuntimeConfig } = getConfig();
    useEffect(() => {
        const fetchCustomers = async () => {
            const data = (await axios.post(`${publicRuntimeConfig.SERVER_URL}getUsers`)).data;
            if (data.status === 'success') setUsers(data.users.map((item) => ({...item, avatar: '/assets/avatars/avatar-jie-yan-song.png',})));
        }
        fetchCustomers().then();
    }, [])
    const filteredCustomers = useFilteredCustomers(users, searchWord);
    const customers = useCustomers(filteredCustomers, page, rowsPerPage);
    const customersIds = useCustomerIds(customers);
    const customersSelection = useSelection(customersIds);

    const handlePageChange = useCallback(
        (event, value) => {
            setPage(value);
        },
        []
    );

    const handleRowsPerPageChange = useCallback(
        (event) => {
            setRowsPerPage(event.target.value);
        },
        []
    );

    const handleSearch = useCallback(
        (event) => {
            setSearchWord(event.target.value);
        },
        []
    )

    return (
        <>
            <Head>
                <title>
                    Customers | Sapien Eleven
                </title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={3}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={4}
                        >
                            <Stack spacing={1}>
                                <Typography variant="h4">
                                    Customers
                                </Typography>
                            </Stack>
                            <div>
                                <Button
                                    startIcon={(
                                        <SvgIcon fontSize="small">
                                            <PlusIcon/>
                                        </SvgIcon>
                                    )}
                                    variant="contained"
                                >
                                    Add
                                </Button>
                            </div>
                        </Stack>
                        <CustomersSearch onSearch={handleSearch} />
                        <CustomersTable
                            count={users.length}
                            items={customers}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            selected={customersSelection.selected}
                        />
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

Page.getLayout = (page) => (
    <DashboardLayout>
        {page}
    </DashboardLayout>
);

export default Page;
