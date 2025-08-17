const getOrSaveFromStorage = ({
  key,
  value,
  get,
}: {
  key: string;
  value?: any;
  get?: boolean;
}) => {
  if (get)
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key) as string)
      : null;
  else localStorage.setItem(key, JSON.stringify(value));
};

export { getOrSaveFromStorage };
