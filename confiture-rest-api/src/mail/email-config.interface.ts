export interface EmailConfig<Data = any> {
  subject: (data: Data) => string;
  plain: (data: Data) => string;
  html: (data: Data) => string;
}
