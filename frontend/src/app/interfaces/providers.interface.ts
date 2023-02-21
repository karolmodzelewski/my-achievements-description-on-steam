import { HttpInterceptor } from "@angular/common/http";
import { InjectionToken } from "@angular/core";

export interface Providers {
    provide: InjectionToken<HttpInterceptor[]>;
    useClass: any;
    multi: boolean;
}
