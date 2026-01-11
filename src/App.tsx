import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import type { Artwork } from './types'

const API_URL = 'https://api.artic.edu/api/v1/artworks'

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)

  // 🔑 ONLY store selected IDs (important rule)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const [showDialog, setShowDialog] = useState(false)
  const [selectCount, setSelectCount] = useState<number>(0)

  const rows = 10

  // 🔹 Fetch data page-wise (NO PREFETCHING)
  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}?page=${page + 1}&limit=${rows}`)
      .then(res => res.json())
      .then(data => {
        setArtworks(data.data)
        setTotalRecords(data.pagination.total)
        setLoading(false)
      })
  }, [page])

  // 🔹 Selection logic for current page
  const onSelectionChange = (e: any) => {
    const newSet = new Set(selectedIds)
    e.value.forEach((item: Artwork) => newSet.add(item.id))
    setSelectedIds(newSet)
  }

  // 🔹 Restore selection on page change
  const selectedRows = artworks.filter(a => selectedIds.has(a.id))

  // 🔹 Select N rows from current page
  const selectNRows = () => {
    const newSet = new Set(selectedIds)
    artworks.slice(0, selectCount).forEach(a => newSet.add(a.id))
    setSelectedIds(newSet)
    setShowDialog(false)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Art Institute of Chicago – Artworks</h2>

      <Button
        label="Select N Rows"
        icon="pi pi-check-square"
        onClick={() => setShowDialog(true)}
        style={{ marginBottom: '1rem' }}
      />

      <DataTable
        value={artworks}
        loading={loading}
        paginator
        rows={rows}
        totalRecords={totalRecords}
        first={page * rows}
        onPage={(e) => setPage(e.page ?? 0)}
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        selectionMode="checkbox"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      {/* 🔹 Custom Overlay Panel */}
      <Dialog
        header="Select Rows"
        visible={showDialog}
        onHide={() => setShowDialog(false)}
      >
        <InputNumber
          value={selectCount}
          onValueChange={(e) => setSelectCount(e.value || 0)}
          placeholder="Enter number of rows"
        />
        <br /><br />
        <Button label="Select" onClick={selectNRows} />
      </Dialog>
    </div>
  )
}

export default App
