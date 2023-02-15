import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WrapperComponent } from './components/wrapper/wrapper.component';
import { MockMainInterceptor } from './mocks/mock-main.interceptor';
import { Providers } from './interfaces/providers.interface';
import { RequestsInterceptor } from './interceptors/requests.interceptor';
import { environment } from './../environments/environment';

const requestsInterceptor: Providers = {
    provide: HTTP_INTERCEPTORS,
    useClass: RequestsInterceptor,
    multi: true,
};
const providers: Providers[] = [
    requestsInterceptor,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: MockMainInterceptor,
        multi: true,
    },
];

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, WrapperComponent],
    providers: environment.production ? [requestsInterceptor] : providers,
    bootstrap: [AppComponent],
})
export class AppModule {}
