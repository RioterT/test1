import { Injectable } from '@angular/core';
import loader, { Imports } from '@assemblyscript/loader';

interface WasmExports {
  add: (a: number, b: number) => number;
  // Add other exported functions or variables here if needed
}

@Injectable({
  providedIn: 'root',
})
export class WasmService {
  private wasmInstance: WebAssembly.Instance | undefined;
  private wasmExports: WasmExports | undefined;

  constructor() {}

  async streamWasm(wasm: string): Promise<any> {
    // Create a mutable WebAssembly.Global for the stack pointer
    const stackPointer = new WebAssembly.Global(
      { value: 'i32', mutable: true },
      1024
    ); // Initialize to a valid stack pointer value

    // Create a WebAssembly.Table for indirect function calls
    const functionTable = new WebAssembly.Table({
      element: 'anyfunc',
      initial: 10,
    }); // Adjust `initial` to the number of functions you expect to store

    // Define the imports object, including the table and stack pointer
    const imports = {
      env: {
        __stack_pointer: stackPointer,
        __memory_base: 0, // Set memory base, if required
        __table_base: 0, // Set table base, if required
        __indirect_function_table: functionTable, // This is the WebAssembly.Table object
        memory: new WebAssembly.Memory({ initial: 1 }), // Define memory, if required
        // Add any other necessary imports here
      },
    };

    if (!loader.instantiateStreaming) {
      return this.wasmFallback(wasm, imports);
    }

    const instance = await loader.instantiateStreaming(fetch(wasm), imports);
    return instance?.exports;
  }

  async wasmFallback(wasm: string, imports: Imports) {
    console.log('using fallback');
    const response = await fetch(wasm);
    const bytes = await response?.arrayBuffer();
    const { instance } = await loader.instantiate(bytes, imports);

    return instance?.exports;
  }
}
