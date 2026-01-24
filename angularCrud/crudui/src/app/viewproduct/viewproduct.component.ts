import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NgserviceService } from '../ngservice.service';
import { Complain } from '../product';
import { StorageService } from '../services/storage.service';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-viewproduct',
  templateUrl: './viewproduct.component.html',
  styleUrls: ['./viewproduct.component.css']
})
export class ViewproductComponent {
  showProducts = false;
  isLoggedIn = false;
  private roles: string[] = [];
  public product: Complain = new Complain(0, "", "", "", "", "", 0, 0, "", "", "", "", "", "", "");


  constructor(private _route: Router, private _service: NgserviceService, private _activatedRoute: ActivatedRoute, private storageService: StorageService) { }

  ngOnInit() {

    let id = parseInt(this._activatedRoute.snapshot.paramMap.get('id') || '', 10);  //to fetch values from database

    this._service.fetchProductByIdFromRemote(id).subscribe(
      {
        next: (data) => {
          console.log("data recieved");
          this.product = data;
        },
        error: (error) => console.log("error occurred")
      }
    )


    this.isLoggedIn = !!this.storageService.getToken();
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;
      this.showProducts = this.roles.includes('ROLE_ADMIN');
    }

  }




  gotolist() {
    console.log('go back');
    this._route.navigate(['productlist']);
  }

  goToEditProduct(complainId: number) {
    console.log('Editing complaint with id ' + complainId);
    this._route.navigate(['/editproduct', complainId]);
  }

  // Download PDF functionality
  downloadPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add VJTI Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19); // Brown color
    doc.text('VJTI Mumbai', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 8;
    doc.setFontSize(16);
    doc.text('IDM Complaint Management', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Complaint Details Report', pageWidth / 2, yPosition, { align: 'center' });

    // Add horizontal line
    yPosition += 5;
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Priority Badge (if High)
    if (this.product.priority === 'High') {
      doc.setFillColor(231, 76, 60); // Red background
      doc.setTextColor(255, 255, 255); // White text
      doc.roundedRect(20, yPosition, 35, 8, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('HIGH PRIORITY', 22, yPosition + 5.5);
      yPosition += 12;
    }

    // Status Badge
    let statusColor = [52, 152, 219]; // Blue default
    if (this.product.status === 'Done') statusColor = [46, 204, 113]; // Green
    else if (this.product.status === 'Assigned') statusColor = [230, 126, 34]; // Orange
    else if (this.product.status === 'Logged') statusColor = [231, 76, 60]; // Red

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(20, yPosition, 30, 8, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.product.status}`, 22, yPosition + 5.5);
    yPosition += 15;

    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Complaint Details
    const addField = (label: string, value: any) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, yPosition);
      doc.setFont('helvetica', 'normal');

      // Handle long text wrapping
      const lines = doc.splitTextToSize(String(value || 'N/A'), pageWidth - 80);
      doc.text(lines, 80, yPosition);
      yPosition += (lines.length * 6) + 2;
    };

    addField('Complaint ID', this.product.complainId);
    addField('Subject', this.product.complainSubject);
    addField('Description', this.product.complainDescription);
    addField('Role of Complainer', this.product.roleOfComplainer);
    addField('Mobile Number', this.product.mobileNumber);
    addField('Department', this.product.dept);
    addField('Room Number', this.product.roomNo);
    addField('Floor Number', this.product.floorNo);
    addField('Building', this.product.building);
    addField('Email', this.product.email);
    addField('Created Date', this.product.createdDate);
    addField('Priority', this.product.priority);

    if (this.product.reason) {
      addField('Reason/Note', this.product.reason);
    }

    if (this.showProducts && this.product.note) {
      addField('Admin Note', this.product.note);
    }

    // Add images if available
    if (this.product.imageOfSubject) {
      yPosition += 10;
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Problem Image:', 20, yPosition);
      yPosition += 5;

      try {
        const imgWidth = 80;
        const imgHeight = 60;
        doc.addImage(this.product.imageOfSubject, 'JPEG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text('(Image could not be embedded)', 20, yPosition);
        yPosition += 10;
      }
    }

    // Add completion image if exists
    if (this.product.afterCompletionImage) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Completed Work Image:', 20, yPosition);
      yPosition += 5;

      try {
        const imgWidth = 80;
        const imgHeight = 60;
        doc.addImage(this.product.afterCompletionImage, 'JPEG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text('(Image could not be embedded)', 20, yPosition);
        yPosition += 10;
      }
    }

    // Add footer
    const currentDate = new Date().toLocaleDateString('en-IN');
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${currentDate}`, 20, pageHeight - 10);
    doc.text(`© 2025 VJTI Mumbai - IDM Complaint Management`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    doc.save(`Complaint_${this.product.complainId}_Details.pdf`);
  }



  printDetails() {
    const printWindow = window.open('', '', 'width=800,height=600');

    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Complaint Details - ${this.product?.complainId}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            .print-header { text-align: center; margin-bottom: 20px; }
            .print-header h2 { color: #000; margin-bottom: 10px; }
            .print-content { display: flex; flex-direction: column; }
            .print-image { text-align: center; margin-bottom: 20px; }
            .print-image img { max-width: 50%; height: auto; }
            .print-details { margin-top: 20px; }
            .priority-high { 
              background-color: #e74c3c; 
              color: white; 
              padding: 5px 10px; 
              border-radius: 5px;
              display: inline-block;
              margin-bottom: 15px;
            }
            .detail-row { margin-bottom: 10px; }
            .detail-label { font-weight: bold; }
            @page { size: auto; margin: 10mm; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>Complaint Details</h2>
            ${this.product?.priority === 'High' ?
          `<div class="priority-high">High Priority</div>` : ''}
            <p>Printed on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="print-content">
            ${this.product?.imageOfSubject ?
          `<div class="print-image">
                <img src="${this.product.imageOfSubject}" alt="Complaint Image">
              </div>` : ''}
            
            <div class="print-details">
              ${this.getPrintableDetails()}
            </div>
          </div>
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  getPrintableDetails(): string {
    if (!this.product) return '';

    return `
    <div class="detail-row"><span class="detail-label">Complaint ID:</span> ${this.product.complainId}</div>
    <div class="detail-row"><span class="detail-label">Subject:</span> ${this.product.complainSubject}</div>
    <div class="detail-row"><span class="detail-label">Description:</span> ${this.product.complainDescription}</div>
    <div class="detail-row"><span class="detail-label">Department:</span> ${this.product.dept}</div>
    <div class="detail-row"><span class="detail-label">Building:</span> ${this.product.building}</div>
    <div class="detail-row"><span class="detail-label">Floor:</span> ${this.product.floorNo}</div>
    <div class="detail-row"><span class="detail-label">Room:</span> ${this.product.roomNo}</div>
    <div class="detail-row"><span class="detail-label">Created Date:</span> ${this.product.createdDate}</div>
  `;
  }



  // Add this to your component class
  printMarathi() {
    const translations: { [key: string]: string } = {
      'Complain Details': 'तक्रारीचा तपशील',
      'Complain ID': 'तक्रार क्रमांक',
      'Complain Subject': 'तक्रारीचा विषय',
      'Complain Description': 'तक्रारीचे वर्णन',
      'Role of Complainer': 'तक्रारदाराची भूमिका',
      'Department': 'विभाग',
      'Room Number': 'खोली क्रमांक',
      'Floor Number': 'मजला क्रमांक',
      'Building': 'इमारत',
      'Email': 'ईमेल',
      'Created Date': 'तारीख',
      'High Priority': 'उच्च प्राधान्य',
      'Printed on': 'छापली दिनांक'
    };

    const printWindow = window.open('', '', 'width=800,height=600');

    if (printWindow && this.product) {
      // Translate the content
      const translatedContent = this.getTranslatedContent(translations);

      printWindow.document.write(`
      <html>
        <head>
          <title>तक्रारीचा तपशील - ${this.product.complainId}</title>
          <style>
            body { font-family: Arial, "Nirmala UI"; padding: 20px; direction: ltr; }
            .print-header { text-align: center; margin-bottom: 20px; }
            .print-content { display: flex; flex-direction: column; }
            .print-image { text-align: center; margin-bottom: 20px; }
            .print-image img { max-width: 50%; height: auto; }
            .priority-high { 
              background-color: #e74c3c; 
              color: white; 
              padding: 5px 10px;
              border-radius: 5px;
              display: inline-block;
              margin-bottom: 15px;
            }
            .detail-row { margin-bottom: 10px; }
            .detail-label { font-weight: bold; }
            @page { size: auto; margin: 10mm; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>${translations['Complain Details']}</h2>
            ${this.product.priority === 'High' ?
          `<div class="priority-high">${translations['High Priority']}</div>` : ''}
            <p>${translations['Printed on']} ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="print-content">
            ${this.product.imageOfSubject ?
          `<div class="print-image">
                <img src="${this.product.imageOfSubject}" alt="Complaint Image">
              </div>` : ''}
            
            <div class="print-details">
              ${translatedContent}
            </div>
          </div>
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  getTranslatedContent(translations: { [key: string]: string }): string {
    if (!this.product) return '';

    return `
    <div class="detail-row"><span class="detail-label">${translations['Complain ID']}:</span> ${this.product.complainId}</div>
    <div class="detail-row"><span class="detail-label">${translations['Complain Subject']}:</span> ${this.product.complainSubject}</div>
    <div class="detail-row"><span class="detail-label">${translations['Complain Description']}:</span> ${this.product.complainDescription}</div>
    <div class="detail-row"><span class="detail-label">${translations['Role of Complainer']}:</span> ${this.product.roleOfComplainer}</div>
    <div class="detail-row"><span class="detail-label">${translations['Department']}:</span> ${this.product.dept}</div>
    <div class="detail-row"><span class="detail-label">${translations['Room Number']}:</span> ${this.product.roomNo}</div>
    <div class="detail-row"><span class="detail-label">${translations['Floor Number']}:</span> ${this.product.floorNo}</div>
    <div class="detail-row"><span class="detail-label">${translations['Building']}:</span> ${this.product.building}</div>
    <div class="detail-row"><span class="detail-label">${translations['Email']}:</span> ${this.product.email}</div>
    <div class="detail-row"><span class="detail-label">${translations['Created Date']}:</span> ${this.product.createdDate}</div>
  `;
  }
}
