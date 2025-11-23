export enum AttendanceEventType {
    CHECK_IN = 'CHECK_IN',
    CHECK_OUT = 'CHECK_OUT'
}

export interface AttendanceEventData {
    attendanceId: string;
    userId: string;
    userName: string;
    checkInTime?: Date;
    checkOutTime?: Date;
}

export interface AttendanceEvent {
    eventId: string;
    eventType: AttendanceEventType;
    timestamp: Date;
    data: AttendanceEventData;
}