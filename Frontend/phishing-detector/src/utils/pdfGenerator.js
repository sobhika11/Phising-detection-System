import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (result) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleString();
  const fileNameDate = new Date().toISOString().split('T')[0];
  const safeHost = result.hostname ? result.hostname.replace(/[^a-z0-9]/gi, '-') : 'unknown';
  const fileName = `phishing-report-${safeHost}-${fileNameDate}.pdf`;

  // Colors
  const primaryColor = [26, 35, 126]; // Navy 900
  const riskColor = 
    result.risk === 'high' ? [220, 38, 38] : 
    result.risk === 'medium' ? [217, 119, 6] : 
    [5, 150, 105];

  // Header
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Threat Intel: Phishing Analysis Report', 14, 25);
  
  // Subheader
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Scan Overview', 14, 55);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 58, 196, 58);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Scanned URL:`, 14, 66);
  doc.setFont('helvetica', 'bold');
  const urlLines = doc.splitTextToSize(result.url || result.hostname, 150);
  doc.text(urlLines, 50, 66);

  let cursorY = 66 + (urlLines.length * 5);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Scan Date:`, 14, cursorY);
  doc.setFont('helvetica', 'bold');
  doc.text(date, 50, cursorY);

  cursorY += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Final Verdict:`, 14, cursorY);
  doc.setTextColor(...riskColor);
  doc.setFont('helvetica', 'bold');
  doc.text(result.risk.toUpperCase() + ` (Score: ${result.score}/100)`, 50, cursorY);

  if (result.neighborhoodAlert && result.neighborhoodAlert.ip) {
    cursorY += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Hosting IP:`, 14, cursorY);
    doc.setFont('helvetica', 'bold');
    doc.text(result.neighborhoodAlert.ip, 50, cursorY);
  }

  // Key Findings Table
  cursorY += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Detected Indicators', 14, cursorY);
  
  const findingsData = result.findings.map(f => [
    f.rule,
    f.explanation,
    `+${f.weight}`
  ]);

  if (findingsData.length > 0) {
    doc.autoTable({
      startY: cursorY + 5,
      head: [['Indicator', 'Description', 'Weight']],
      body: findingsData,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' }
      }
    });
    cursorY = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No suspicious indicators triggered.', 14, cursorY + 8);
    cursorY += 20;
  }

  // Neighborhood Alert
  if (result.neighborhoodAlert) {
    // Check page break
    if (cursorY > 250) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Graph Analysis: Neighborhood Alert', 14, cursorY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    cursorY += 8;
    const summaryLines = doc.splitTextToSize(`Summary: ${result.neighborhoodAlert.message}`, 180);
    doc.text(summaryLines, 14, cursorY);
    
    cursorY += summaryLines.length * 5 + 2;

    if (result.neighborhoodAlert.riskyNeighborCount > 0) {
      const neighborData = result.neighborhoodAlert.riskyNeighbors.map(n => [n]);
      doc.autoTable({
        startY: cursorY,
        head: [['Suspicious Neighbors on Same IP']],
        body: neighborData,
        theme: 'plain',
        styles: { fontSize: 9, textColor: [220, 38, 38], fontStyle: 'bold' },
        headStyles: { fillColor: [254, 242, 242], textColor: [153, 27, 27] }
      });
      cursorY = doc.lastAutoTable.finalY + 15;
    } else {
      cursorY += 10;
    }
  }

  // Analyst Summary
  if (cursorY > 230) {
    doc.addPage();
    cursorY = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Analyst Notes / Conclusion', 14, cursorY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const conclusion = result.risk === 'high' 
    ? 'This URL exhibits multiple traits strongly correlated with phishing and social engineering attacks. Immediate blocking advised.'
    : result.risk === 'medium'
    ? 'This URL shows suspicious traits that warrant closer inspection. Recommend manual review before accessing.'
    : 'No overt malicious indicators were found. The URL appears to be safe based on current heuristics.';
  
  const conclusionLines = doc.splitTextToSize(conclusion, 180);
  doc.text(conclusionLines, 14, cursorY + 8);
  
  cursorY += (conclusionLines.length * 5) + 15;

  // Screenshot Placeholder or Actual
  if (cursorY > 180) {
      doc.addPage();
      cursorY = 20;
  }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Site Preview (Controlled Headless Capture)', 14, cursorY);
  
  if (result.sanitizedView && result.sanitizedView.available && result.sanitizedView.imageUrl) {
    try {
      doc.addImage(result.sanitizedView.imageUrl, 'JPEG', 14, cursorY + 5, 182, 114);
      doc.setDrawColor(200, 200, 200);
      doc.rect(14, cursorY + 5, 182, 114); // border
    } catch (e) {
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.rect(14, cursorY + 5, 182, 80, 'FD');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(14);
      doc.text('Image Conversion Failed', 105, cursorY + 45, { align: 'center' });
    }
  } else {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.rect(14, cursorY + 5, 182, 80, 'FD');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(14);
    doc.text(result.sanitizedView?.error || 'Image Not Available', 105, cursorY + 45, { align: 'center' });
  }

  // Save the PDF
  doc.save(fileName);
};
