import axios from 'axios';
import Cookies from 'js-cookie';

let serverUrl;

if(process.env.NODE_ENV === 'development') {
    serverUrl = 'http://localhost:5000'
} else {
    serverUrl = "https://hospital-ms-sb0k.onrender.com";
}
export const apiUrl = `${serverUrl}/api`;
const pendingRequests = new Map();

const axiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

const setUpAxiosInterceptors = () => {
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = Cookies.get('token');
            if(token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
          // Special handling for login endpoint with token in error response
          if (error.config.url.includes('Account/login') && 
          error.response?.data?.token) {
              // Convert error to success response
              return {
                  ...error.response,
                  status: 200,
                  data: error.response.data
              };
          }
          return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if(error.response && error.response.status === 401  && !originalRequest._retry) {
                try {
                    let newToken;
                    // const newToken = await refreshAccessToken();
                    originalRequest._retry = true;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                } catch (error) {
                    Cookies.remove('token');
                    Cookies.remove('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            }

            return Promise.reject(error);
        }
    );
}

setUpAxiosInterceptors();


export const getDataAPI = async (url, onProgress) => {
    try {
      const res = await axiosInstance.get(url, {
        onDownloadProgress: onProgress,
      });
      return res.data;
    } catch (error) {
      // console.error("Error fetching data:", error);
      throw error.response.data;
    }
  };
  
  let requestKey;
  export const postDataAPI = async (url, post, onProgress) => {
    try {
      if (!post || (url.includes('login') && (!post.Email || !post.Password))) {
        throw new Error('Missing required fields');
      }
      requestKey = `${url}_${JSON.stringify(post)}`;

      if (pendingRequests.has(requestKey)) {
        pendingRequests.get(requestKey).cancel();
      }

      const cancelToken = axios.CancelToken.source();
      pendingRequests.set(requestKey, cancelToken);

      const res = await axiosInstance.post(url, post, {
        onUploadProgress: onProgress,
        cancelToken: cancelToken.token,
      });
      // console.log(res);
      return res.data;
    } catch (error) {
      // Special handling for login endpoint
      if (url === 'Account/login' && error.response?.data?.token) {
        // If we have a token, consider it a success despite the status code
        return error.response.data;
      }
      throw error.response.data;
    } finally {
      // pendingRequests.delete(requestKey);
    }
  };  
  export const putDataAPI = async (url, post, onProgress) => {
    try {
      const res = await axiosInstance.put(url, post, {
        onUploadProgress: onProgress,
      });
      return res.data;
    } catch (error) {
      // console.error("Error updating data:", error);
      throw error.response.data;
    }
  };
  
  export const patchDataAPI = async (url, post, onProgress) => {
    try {
      const res = await axiosInstance.patch(url, post, {
        onUploadProgress: onProgress,
      });
      return res.data;
    } catch (error) {
      // console.error("Error patching data:", error);
      throw error.response.data;
    }
  };
  
  export const deleteDataAPI = async (url, onProgress) => {
    try {
      const res = await axiosInstance.delete(url, {
        onDownloadProgress: onProgress,
      });
      return res.data;
    } catch (error) {
      // console.error("Error deleting data:", error);
      throw error.response.data;
    }
  };

  export const postMediaAPI = async (url, post, onProgress) => {
    try {
      const res = await axiosInstance.post(url, post, {
        headers: { "Content-Type": "multipart/form-data",
            'Accept': 'application/json',
         },
        onUploadProgress: onProgress,
      });
      return res.data;
    } catch (error) {
      console.error("Error posting media:", error);
      throw error.response.data;
    }
  };


export default serverUrl;