import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WasmService } from './wasm.service';
import { WebAssemblyLoaderService } from './web-assembly-loader.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  result: number = 0;
  chartOption: any;
  instance!: any;
  instancePrime!: any;
  primeWasm = '/assets/prime.wasm';
  addWasm = '/assets/add.wasm';
  wasmLoader = inject(WebAssemblyLoaderService);
  isPrime: boolean = false;
  number: number = 0;
  numberf: number = 0;
  numbers: number = 0;

  constructor(private wasmService: WasmService) {}

  async ngOnInit() {
    this.instancePrime = await this.wasmLoader.streamWasm(this.primeWasm);
    console.log(this.instancePrime);

    this.instance = await this.wasmService.streamWasm(this.addWasm);
    console.log(this.instance);
  }

  add(val: number, fist: boolean) {
    if (fist) {
      this.numberf = val;
    } else {
      this.numbers = val;
    }

    this.result = this.instance.add(this.numberf, this.numbers);
  }

  checkNumber(val: number) {
    this.isPrime = this.instancePrime
      ? this.instancePrime.isPrime(val) === 1
      : false;
  }
}
