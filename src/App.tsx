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

  // pagination
  const [page, setPage] = useState(0)
  const rows = 10
  const [totalRecords, setTotalRecords] = useState(0)

  // 🔑 store ONLY selected IDs
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [selectCount, setSelectCount] = useState<number>(0)

  // 🔹 fetch ONLY current page (NO prefetching)
  useEffect(() => {
    setLoading(true)

    fetch(`${API_URL}?page=${page + 1}&limit=${rows}`)
      .then(res => res.json())
      .then(data => {
        setArtworks(data.data)
        setTotalRecords(data.pagination.total)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  // 🔹 restore selection for current page
  const selectedRows = artworks.filter(a => selectedIds.has(a.id))

  // 🔹 handle checkbox select / deselect
  const onSelectionChange = (e: any) => {
    const newSet = new Set(selectedIds)

    // remove deselected rows from CURRENT page
    artworks.forEach(a => {
      if (!e.value.some((v: Artwork) => v.id === a.id)) {
        newSet.delete(a.id)
      }
    })

    // add selected rows
    e.value.forEach((a: Artwork) => newSet.add(a.id))

    setSelectedIds(newSet)
  }

  // 🔹 custom select N rows (STRICTLY current page only)
  const selectNRows = () => {
    const newSet = new Set(selectedIds)

    const maxSelectable = artworks.length
    const count = Math.min(selectCount, maxSelectable)

    artworks.slice(0, count).forEach(a => newSet.add(a.id))

    setSelectedIds(newSet)
    setShowDialog(false)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Art Institute of Chicago – Artworks</h2>

      <Button
        label="Select N Rows (Current Page Only)"
        icon="pi pi-check-square"
        onClick={() => setShowDialog(true)}
        style={{ marginBottom: '1rem' }}
      />

      {/* ✅ UPDATED DataTable */}
      <DataTable
        value={artworks}
        lazy
        paginator
        rows={rows}
        totalRecords={totalRecords}
        first={page * rows}
        onPage={(e) => setPage(e.page ?? 0)}
        loading={loading}
        dataKey="id"
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        selectionMode="checkbox"   // ✅ THIS FIXES THE BUILD ERROR
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      {/* Custom Select Dialog */}
      <Dialog
        header="Select Rows"
        visible={showDialog}
        onHide={() => setShowDialog(false)}
      >
        <p style={{ fontSize: '0.9rem' }}>
          Selection is limited to the current page only.
        </p>

        <InputNumber
          value={selectCount}
          onValueChange={(e) => setSelectCount(e.value || 0)}
          placeholder="Enter number of rows"
          min={0}
        />

        <br /><br />
        <Button label="Select" onClick={selectNRows} />
      </Dialog>
    </div>
  )
}

export default App
