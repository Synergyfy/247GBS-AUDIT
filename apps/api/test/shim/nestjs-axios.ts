import { Module, DynamicModule, type Provider } from '@nestjs/common';
import { Observable } from 'rxjs';

// E2E test shim for `@nestjs/axios`.
//
// The real package ships ESM-only (`"type": "module"`) which jest's CommonJS
// runtime cannot `require` (AppModule pulls it in via the MCOM module). The
// e2e suites under `test/` never exercise MCOM's outbound HTTP calls, so a
// minimal Nest module/HttpService stub is used instead.

export class HttpService {
  #notAvailable() {
    throw new Error('HttpService is not available in e2e test suites.');
  }
  request() {
    return new Observable(() => this.#notAvailable());
  }
  get() {
    return new Observable(() => this.#notAvailable());
  }
  post() {
    return new Observable(() => this.#notAvailable());
  }
  put() {
    return new Observable(() => this.#notAvailable());
  }
  patch() {
    return new Observable(() => this.#notAvailable());
  }
  delete() {
    return new Observable(() => this.#notAvailable());
  }
  head() {
    return new Observable(() => this.#notAvailable());
  }
}

const httpServiceProvider: Provider = {
  provide: HttpService,
  useValue: new HttpService(),
};

@Module({ providers: [httpServiceProvider], exports: [HttpService] })
export class HttpModule {
  static register(): DynamicModule {
    return { module: HttpModule, providers: [httpServiceProvider], exports: [HttpService] };
  }
  static registerAsync(): DynamicModule {
    return { module: HttpModule, providers: [httpServiceProvider], exports: [HttpService] };
  }
}