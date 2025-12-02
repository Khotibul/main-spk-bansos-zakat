'use client';
import { MainLayout } from '../main-layout/main-layout';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  CalendarIcon,
  ChevronDown,
  MoreHorizontal,
  Pen,
  Plus,
  Save,
  Trash,
  UserRoundMinus,
  UserRoundPlus
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { dosen, mahasiswa } from '@/seed/data.seed';
import type {
  PengabdianMasyarakatPayload,
  PengmasForm,
  PengmasPayload
} from '@/types/pengabdian-masyarakat';
import type { Dosen, Mahasiswa } from '@prisma/client';
import { addDays, format } from 'date-fns';
import { useContext, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { useFieldArray, useForm } from 'react-hook-form';

// const data: Payment[] = [
//   {
//     id: 'm5gr84i9',
//     judul: 'Sistem Kesehatan Masyarakat Terpadu',
//     ketua: { nidn: '00-1234-4321', nama: 'Dr. Rr. Ani Dijah Rahajoe, ST, M.Cs.' },
//     dosenAnggota: [
//       { nidn: '00-1299-9921', nama: 'Dr. Mohammad Idhom, S.Kom., M.Kom' },
//       { nidn: '00-6969-9696', nama: 'Dr. Gede Susrama Mas Diyasa, ST., MT., IPU' }
//     ],
//     mahasiswa: [
//       { npm: '23066020022', nama: 'Daniel Gloryo Nadirco' },
//       { npm: '23066020024', nama: 'Wigananda Firdaus' }
//     ],
//     amount: 25_000_000
//   },
//   {
//     id: '3u1reuv4',
//     judul: 'Sistem Kesehatan Masyarakat Terpadu',
//     ketua: { nidn: '00-1234-4321', nama: 'Dr. Rr. Ani Dijah Rahajoe, ST, M.Cs.' },
//     dosenAnggota: [
//       { nidn: '00-1299-9921', nama: 'Dr. Mohammad Idhom, S.Kom., M.Kom' },
//       { nidn: '00-6969-9696', nama: 'Dr. Gede Susrama Mas Diyasa, ST., MT., IPU' }
//     ],
//     mahasiswa: [],
//     amount: 50_000_000
//   },
//   {
//     id: 'derv1ws0',
//     judul: 'Sistem Kesehatan Masyarakat Terpadu',
//     ketua: { nidn: '00-1234-4321', nama: 'Dr. Rr. Ani Dijah Rahajoe, ST, M.Cs.' },
//     dosenAnggota: [
//       { nidn: '00-1299-9921', nama: 'Dr. Mohammad Idhom, S.Kom., M.Kom' },
//       { nidn: '00-6969-9696', nama: 'Dr. Gede Susrama Mas Diyasa, ST., MT., IPU' }
//     ],
//     mahasiswa: [],
//     amount: 75_000_000
//   },
//   {
//     id: '5kma53ae',
//     judul: 'Sistem Kesehatan Masyarakat Terpadu',
//     ketua: { nidn: '00-1234-4321', nama: 'Dr. Rr. Ani Dijah Rahajoe, ST, M.Cs.' },
//     dosenAnggota: [
//       { nidn: '00-1299-9921', nama: 'Dr. Mohammad Idhom, S.Kom., M.Kom' },
//       { nidn: '00-6969-9696', nama: 'Dr. Gede Susrama Mas Diyasa, ST., MT., IPU' }
//     ],
//     mahasiswa: [],
//     amount: 10_000_000
//   },
//   {
//     id: 'bhqecj4p',
//     judul: 'Sistem Kesehatan Masyarakat Terpadu',
//     ketua: { nidn: '00-1234-4321', nama: 'Dr. Rr. Ani Dijah Rahajoe, ST, M.Cs.' },
//     dosenAnggota: [
//       { nidn: '00-1299-9921', nama: 'Dr. Mohammad Idhom, S.Kom., M.Kom' },
//       { nidn: '00-6969-9696', nama: 'Dr. Gede Susrama Mas Diyasa, ST., MT., IPU' }
//     ],
//     mahasiswa: [],
//     amount: 86_000_000
//   }
// ];

export type Payment = {
  id: string;
  judul: string;
  ketua: Dosen;
  dosenAnggota: Dosen[];
  mahasiswa: Mahasiswa[];
  amount: number;
};

type Action = 'Create' | 'Edit' | undefined;
type AC = {
  action: { action: Action; pengmas: PengmasPayload | undefined };
  setAction: React.Dispatch<React.SetStateAction<Action>>;
};
const ActionContext = React.createContext<AC | null>(null);
const useActionContext = () => useContext(ActionContext);

export const columns: ColumnDef<PengmasPayload>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'judul',
    header: 'Judul',
    cell: ({ row }) => <div>{row.getValue('judul')}</div>
  },
  {
    accessorKey: 'dosen',
    header: 'Ketua',
    cell: ({ row }) => {
      const ketua = row
        .getValue<any[]>('dosen')
        .find((item) => item.isKetua === true);
      return (
        <div className='flex flex-col'>
          <p>{ketua.dosen.nama}</p>
          <p className='text-xs font-bold'>NIDN {ketua.dosen.nidn}</p>
        </div>
      );
    }
  },
  {
    accessorKey: 'mahasiswa',
    header: 'Anggota',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <p className='w-1/3 border-b border-slate-400'>Dosen</p>
        {row
          .getValue<any[]>('dosen')
          .filter((item) => item.isKetua === false)
          .map((dosen) => (
            <div key={dosen.nidn} className='flex flex-col'>
              <p>{dosen.dosen.nama}</p>
              <p className='text-xs font-bold'>NIDN {dosen.nidn}</p>
            </div>
          ))}
        <div className='h-2' />
        <p className='w-1/3 border-b border-slate-400'>Mahasiswa</p>
        {row.getValue<any[]>('mahasiswa').map((item) => (
          <div key={item.npm} className='flex flex-col'>
            <p>{item.mahasiswa.nama}</p>
            <p className='text-xs font-bold'>NPM {item.npm}</p>
          </div>
        ))}
      </div>
    )
  },
  {
    accessorKey: 'anggaran',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='text-right'
        >
          Anggaran
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('anggaran'));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(amount);

      return <div className='text-right font-medium'>{formatted}</div>;
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      const actionContext = useActionContext();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {/* <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                actionContext!.setAction('Edit');
              }}
            >
              Edit <Pen />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Delete <Trash />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function PengabdianMasyarakat() {
  const { control, register, watch, getValues, setValue, handleSubmit } =
    useForm<PengmasForm>();
  const wKetuaNIDN = watch('dosen')?.find(
    (item) => item?.isKetua === true
  )?.nidn;
  const { fields, append, remove } = useFieldArray<PengmasForm>({
    control,
    name: 'dosen'
  });
  const {
    fields: fieldsMhs,
    append: appendMhs,
    remove: removeMhs
  } = useFieldArray<PengmasForm>({
    control,
    name: 'mahasiswa'
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<PengmasPayload[]>([]);
  const [action, setAction] = React.useState<Action>();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20)
  });
  const [posting, setPosting] = React.useState(false);

  useEffect(() => {
    if (date?.from) {
      setValue('tgl_mulai', new Date(date.from).toISOString());
    }
    if (date?.to) {
      setValue('tgl_selesai', new Date(date.to).toISOString());
    }
  }, [date]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  async function fetchPengmas() {
    const response = await fetch('/api/pengabdian-masyarakat', {
      headers: { 'Content-Type': 'application/json' }
    });
    const responseData = (await response.json()) as PengmasPayload[];
    console.log('responseData', responseData);
    setData(responseData);
  }

  useEffect(() => {
    fetchPengmas();
    return () => {
      setData([]);
    };
  }, []);

  async function submit(data) {
    setPosting(true);
    console.log('submitted data', data);
    const response = await fetch('/api/pengabdian-masyarakat', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(data)
    });
    console.log('response', response);
    const responseData = await response.json();
    console.log('responseData', responseData);
    fetchPengmas();
    setPosting(false);
  }

  return (
    <ActionContext.Provider
      value={{ action: { action, pengmas: undefined }, setAction }}
    >
      <MainLayout>
        <div className='flex justify-between items-center py-4'>
          <Input
            placeholder='Cari Judul...'
            value={(table.getColumn('judul')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('judul')?.setFilterValue(event.target.value)
            }
            className='max-w-sm'
          />
          <div className='flex gap-2'>
            <Button
              type='button'
              disabled={posting}
              onClick={() => {
                if (!action) {
                  setAction('Create');
                } else {
                  submit(getValues());
                  // setAction(undefined);
                }
              }}
              className='ml-auto'
            >
              {action === undefined && (
                <>
                  Ajukan <Plus />
                </>
              )}
              {action !== undefined && (
                <>
                  Simpan <Save />
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='ml-auto'>
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className='capitalize'
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Form */}
        {action !== undefined && (
          <form
            className='mb-6 p-2 flex flex-col'
            onSubmit={handleSubmit(submit)}
          >
            <p className='font-bold border-b w-1/2 mb-2'>
              {action === 'Create' ? 'Pengajuan' : 'Perbarui'} Pengabdian
              Masyarakat
            </p>
            <div className='flex flex-col gap-3'>
              {/* Judul */}
              <div className='grid w-full max-w-md items-center gap-1.5'>
                <Label htmlFor='judul'>Judul</Label>
                <Textarea
                  id='judul'
                  placeholder='Judul Pengabdian Masyarakat'
                  {...register('judul')}
                />
              </div>

              {/* Ketua */}
              <div className='flex items-center gap-3'>
                <div className='grid w-full max-w-md items-center gap-1.5'>
                  <Label htmlFor='ketua'>Ketua</Label>
                  <Select
                    onValueChange={(value) => {
                      const ketuaExistIndex = fields
                        .map((item, index) => {
                          if (item.isKetua === true) {
                            return index;
                          }
                        })
                        .find((item) => {
                          return typeof item === 'number';
                        });
                      if (ketuaExistIndex !== undefined) {
                        remove(ketuaExistIndex);
                      }
                      append({ isKetua: true, nidn: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih Dosen' />
                    </SelectTrigger>
                    <SelectContent>
                      {dosen.map((item) => (
                        <SelectItem key={item.nidn} value={item.nidn}>
                          {item.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className='grid w-full max-w-md items-center gap-1.5'>
                  <Label htmlFor='ketua'>Dosen Anggota</Label>
                  <Select disabled={!wKetuaNIDN}>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih Dosen Anggota' />
                    </SelectTrigger>
                    <SelectContent>
                      {dosen
                        .filter((item) => item.nidn !== wKetuaNIDN)
                        .map((item) => (
                          <SelectItem key={item.nidn} value={item.nidn}>
                            {item.nama}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid w-full max-w-md items-center gap-1.5'>
                  <Label htmlFor='ketua'>Mahasiswa Anggota</Label>
                  <Select disabled={!wKetuaNIDN}>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih Mahasiswa Anggota' />
                    </SelectTrigger>
                    <SelectContent>
                      {mahasiswa.map((item) => (
                        <SelectItem key={item.npm} value={item.npm}>
                          {item.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
              </div>

              {/* Dosen Anggota */}
              <div className='flex items-center gap-2'>
                <Label>Dosen Anggota</Label>
                {!!wKetuaNIDN && (
                  <UserRoundPlus
                    size={18}
                    onClick={() => append({ isKetua: false })}
                  />
                )}
              </div>
              {!!!wKetuaNIDN && (
                <p className='-mt-2 text-xs text-gray-500'>
                  Dosen Ketua belum dipilih.
                </p>
              )}
              {!!wKetuaNIDN && !fields.some((f) => f.isKetua === false) && (
                <p className='-mt-2 text-xs text-gray-500'>
                  Belum ada dosen anggota.
                </p>
              )}
              {fields.length > 0 &&
                fields.map((item, index) => (
                  <div
                    key={item.id}
                    className={`${item.isKetua === true ? 'hidden' : 'flex'} items-center gap-2`}
                  >
                    <div className='grid w-full max-w-md items-center gap-1.5'>
                      <Select
                        disabled={!wKetuaNIDN}
                        onValueChange={(value) => {
                          const anggotaNIDN = `dosen.${index}.nidn`;
                          setValue(anggotaNIDN, value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih Dosen Anggota' />
                        </SelectTrigger>
                        <SelectContent>
                          {dosen
                            .filter((master) => {
                              return (
                                fields
                                  .filter((x) => x.nidn !== item.nidn)
                                  .some(
                                    (field) => master.nidn === field.nidn
                                  ) === false
                              );
                            })
                            .map((item) => (
                              <SelectItem key={item.nidn} value={item.nidn}>
                                {item.nama}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {index > 0 && (
                      <UserRoundMinus size={18} onClick={() => remove(index)} />
                    )}
                  </div>
                ))}

              {/* Mahasiswa Anggota */}
              <div className='flex items-center gap-2'>
                <Label htmlFor='ketua'>Mahasiswa Anggota</Label>
                <UserRoundPlus size={18} onClick={() => appendMhs({})} />
              </div>
              {fieldsMhs.length < 1 && (
                <p className='-mt-2 text-xs text-gray-500'>
                  Belum ada mahasiswa anggota.
                </p>
              )}
              {fieldsMhs.length > 0 &&
                fieldsMhs.map((mhs, index) => (
                  <div key={mhs.id} className='flex items-center gap-2'>
                    <div className='grid w-full max-w-md items-center gap-1.5'>
                      <Select
                        onValueChange={(value) => {
                          const mhsNPM = `mahasiswa.${index}.npm`;
                          setValue(mhsNPM, value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih Mahasiswa Anggota' />
                        </SelectTrigger>
                        <SelectContent>
                          {mahasiswa
                            .filter((st_mhs) => {
                              return (
                                fieldsMhs
                                  .filter((x) => x.npm !== mhs.npm)
                                  .some((field) => st_mhs.npm === field.npm) ===
                                false
                              );
                            })
                            .map((item) => (
                              <SelectItem key={item.npm} value={item.npm}>
                                {item.nama}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <UserRoundMinus
                      size={18}
                      onClick={() => removeMhs(index)}
                    />
                  </div>
                ))}

              {/* Lokasi */}
              <div className='grid w-full max-w-md items-center gap-1.5'>
                <Label htmlFor='lokasi'>Lokasi</Label>
                <Textarea
                  id='lokasi'
                  placeholder='Lokasi Pengabdian Masyarakat'
                  {...register('lokasi')}
                />
              </div>
              {/* Waktu & Anggaran */}
              <div className='flex gap-3'>
                <div className='grid items-center gap-1.5'>
                  <Label htmlFor='waktu'>Waktu</Label>
                  <div className='grid gap-2'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id='date'
                          variant={'outline'}
                          className={cn(
                            'w-[300px] justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, 'LLL dd, y')} -{' '}
                                {format(date.to, 'LLL dd, y')}
                              </>
                            ) : (
                              format(date.from, 'LLL dd, y')
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          initialFocus
                          mode='range'
                          defaultMonth={date?.from}
                          selected={date}
                          onSelect={setDate}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className='grid items-center gap-1.5'>
                  <Label htmlFor='anggaran'>Anggaran</Label>
                  <Input id='anggaran' {...register('anggaran')} />
                </div>
              </div>
              {/* Proposal & Luaran */}
              <div className='flex gap-3'>
                <div className='grid w-full max-w-md items-center gap-1.5'>
                  <Label htmlFor='proposal'>Proposal</Label>
                  <Input id='proposal' type='file' />
                </div>
                <div className='grid w-full max-w-md items-center gap-1.5'>
                  <Label htmlFor='proposal'>Luaran</Label>
                  <Input id='proposal' type='file' multiple />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* View Table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    if (header.column.columnDef.header === 'Mahasiswa') return;
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => {
                        // if (cell.id.includes('mahasiswa')) return;
                        return (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='flex-1 text-sm text-muted-foreground'>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </MainLayout>
    </ActionContext.Provider>
  );
}
