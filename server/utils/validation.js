export const validateEmail=e=>/.+@.+\..+/.test(e)
export const requireFields=arr=>arr.every(v=>v!==undefined&&v!==null&&String(v).trim().length>0)