declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface AutoTableOptions {
    head?: any[][]
    body?: any[][]
    startY?: number
    theme?: 'striped' | 'grid' | 'plain'
    headStyles?: {
      fillColor?: number[]
      textColor?: number[]
      fontSize?: number
    }
    styles?: {
      fontSize?: number
      cellPadding?: number
    }
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void
}
