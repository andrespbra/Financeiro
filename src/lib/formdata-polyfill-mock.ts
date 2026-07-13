export const FormData = typeof window !== 'undefined' ? window.FormData : null;
export const formDataToBlob = (formData: any) => {
  return new Blob();
};
