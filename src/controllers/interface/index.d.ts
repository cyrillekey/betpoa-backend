export interface IDefaultResponse {
  success: boolean
  message: string
  id: number | null
}
export const ISuccessResponse = {
  id: { type: 'number' },
  success: { type: 'boolean' },
  message: { type: 'string' },
}
