declare interface location{
    id                  : number;
    gps_lat             : number;
    gps_lng             : number;
    gps_accuracy        : number;
    gps_provider        : string;
    gps_speed           : string;
    interpolatedPoints  : any;
    hasPhoto            : boolean;
    datatime            : string;
    emoticon            : number;
    isFixedLocation     : number;
    original_gps_lat    : number;
    original_gps_lng    : number;
}