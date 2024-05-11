import { ref } from "vue";
import axios from "axios";

import type { Ref } from "vue";
import type { AxiosRequestConfig } from "axios";

export function useAxios<T>() {
  const isFetching = ref(false);
  const data = ref<T | null>(null) as Ref<T | null>;
  const errMsg = ref("");

  const fetchFn = async (config: AxiosRequestConfig) => {
    isFetching.value = true;
    try {
      const res = await axios<T>(config);
      data.value = res.data;
    } catch (_err: unknown) {
      if (axios.isAxiosError(_err) && _err.response?.data.message) {
        errMsg.value = _err.response.data.message as string;
      } else {
        errMsg.value = _err instanceof Error ? _err.message : "Unexpected error.";
      }
    } finally {
      isFetching.value = false;
    }
  };

  return { isFetching, data, errMsg, fetchFn };
}
