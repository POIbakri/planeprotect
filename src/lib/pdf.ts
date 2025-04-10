import { jsPDF } from 'jspdf';

interface ClaimLetterData {
  passengerName: string;
  flightNumber: string;
  flightDate: string;
  delay: number;
  compensation: number;
}

export function generateClaimLetter(data: ClaimLetterData): Blob {
  const doc = new jsPDF();
  
  // Add letterhead
  doc.setFontSize(20);
  doc.text('PlaneProtect', 20, 20);
  
  doc.setFontSize(12);
  doc.text('Flight Compensation Claim Letter', 20, 30);
  
  // Add current date
  const currentDate = new Date().toLocaleDateString('en-GB');
  doc.text(currentDate, 20, 40);
  
  // Add airline address (example)
  const airlineCode = data.flightNumber.slice(0, 2);
  doc.text(`${airlineCode} Airlines`, 20, 60);
  doc.text('Customer Relations Department', 20, 70);
  
  // Add claim details
  doc.text('Re: Compensation Claim under EC Regulation 261/2004', 20, 90);
  
  let y = 110;
  const text = [
    'Dear Sir/Madam,',
    '',
    `I am writing to claim compensation under EC Regulation 261/2004 for flight ${data.flightNumber} `,
    `on ${new Date(data.flightDate).toLocaleDateString('en-GB')}, which was delayed by ${data.delay} hours.`,
    '',
    'Passenger Details:',
    `Name: ${data.passengerName}`,
    '',
    'Under EC Regulation 261/2004, I am entitled to compensation of',
    `€${data.compensation} due to the significant delay of my flight.`,
    '',
    'I look forward to receiving your response within 14 days.',
    '',
    'Yours faithfully,',
    data.passengerName
  ];
  
  text.forEach(line => {
    doc.text(line, 20, y);
    y += 10;
  });
  
  return doc.output('blob');
}