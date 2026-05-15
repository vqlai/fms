import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.pagination !== undefined) {
          return {
            code: 0,
            data: data.data,
            message: 'success',
            pagination: data.pagination,
          } as ApiResponse<T>
        }

        return {
          code: 0,
          data,
          message: 'success',
        }
      }),
    )
  }
}
