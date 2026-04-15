import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Configurar o cliente axios com timeout maior
    // pois a API pode demorar em horários de pico
    this.client = axios.create({
      baseURL,
      timeout: 30000, // aumentado de 10s para evitar timeout
      validateStatus: () => true, // retorna a resposta mesmo em erro
    });
  }

  async get(endpoint: string, params?: Record<string, any>) {
    try {
      const response = await this.client.get(endpoint, { params });
      console.log(`[GET] ${this.baseURL}${endpoint} - Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`[GET] ${this.baseURL}${endpoint} - Error: ${error}`);
      throw error;
    }
  }

  async post(endpoint: string, data?: any) {
    try {
      const response = await this.client.post(endpoint, data);
      console.log(`[POST] ${this.baseURL}${endpoint} - Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(` [POST] ${this.baseURL}${endpoint} - Error: ${error}`);
      throw error;
    }
  }

  async put(endpoint: string, data?: any) {
    try {
      const response = await this.client.put(endpoint, data);
      console.log(`[PUT] ${this.baseURL}${endpoint} - Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`[PUT] ${this.baseURL}${endpoint} - Error: ${error}`);
      throw error;
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await this.client.delete(endpoint);
      console.log(`[DELETE] ${this.baseURL}${endpoint} - Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`[DELETE] ${this.baseURL}${endpoint} - Error: ${error}`);
      throw error;
    }
  }
}

// Factory pra criar instância do cliente
export function createApiClient(baseURL: string): ApiClient {
  return new ApiClient(baseURL);
}