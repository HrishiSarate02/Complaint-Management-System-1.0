export class Complain {
    complainId: number;
    complainSubject: string;
    complainDescription: string;
    roleOfComplainer: string;
    mobileNumber: string ;
    dept: string;
    roomNo: number;
    floorNo: number;
    building: string;
    imageOfSubject: string;
    email: string;
    status: string;
    createdDate: string; 
    priority: string;
    note : string;
    reason?: string;
    afterCompletionImage?: string;;

    constructor(
        complainId: number,
        complainSubject: string,
        complainDescription: string,
        roleOfComplainer: string,
        mobileNumber:string ,
        dept: string,
        roomNo: number,
        floorNo: number,
        building: string,
        imageOfSubject: string,
        email: string,
        status: string,
        createdDate: string,
        priority: string,
        note : string,
        reason?: string
    ) {
        this.complainId = complainId;
        this.complainSubject = complainSubject;
        this.complainDescription = complainDescription;
        this.roleOfComplainer = roleOfComplainer;
        this.mobileNumber = mobileNumber;
        this.dept = dept;
        this.roomNo = roomNo;
        this.floorNo = floorNo;
        this.building = building;
        this.imageOfSubject = imageOfSubject;
        this.email = email;
        this.status= status;
        this.createdDate = createdDate;
        this.priority = priority;
        this.note = note;
        this.reason = reason;
    }
}
