/**
 * 백엔드 및 네트워크 에러 메시지 공통 변환 유틸리티
 */

const ERROR_MESSAGE_MAP: Record<string, string> = {
  EMAIL_DUPLICATE: '이미 사용 중인 이메일입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 잘못되었습니다.',
  INVALID_TOKEN: '인증 토큰이 유효하지 않습니다.',
  EXPIRED_TOKEN: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.',
  GOOGLE_LOGIN_FAILED: 'Google 로그인 인증에 실패했습니다.',
  BAD_REQUEST: '입력하신 정보를 다시 확인해 주세요.',
  UNAUTHORIZED: '접근 권한이 없거나 인증이 필요합니다.',
  NOT_FOUND: '요청하신 대상을 찾을 수 없습니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  NETWORK_ERROR: '서버와 연결할 수 없습니다. 인터넷 연결 및 백엔드 상태를 확인해 주세요.',
};

export const parseErrorMessage = (error: any): string => {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다.';
  }

  // 1. 이미 string 형태로 정리된 에러인 경우
  if (typeof error === 'string') {
    return ERROR_MESSAGE_MAP[error] || error;
  }

  // 2. errorUtils / api.ts에서 넘겨준 custom error 객체
  if (error.code && ERROR_MESSAGE_MAP[error.code]) {
    return ERROR_MESSAGE_MAP[error.code];
  }

  if (error.message) {
    return ERROR_MESSAGE_MAP[error.message] || error.message;
  }

  // 3. Axios response 에러 구조 파싱
  const errData = error.response?.data;
  if (errData?.error) {
    const code = errData.error.code;
    const msg = errData.error.message;
    if (code && ERROR_MESSAGE_MAP[code]) {
      return ERROR_MESSAGE_MAP[code];
    }
    if (msg) return msg;
  }

  if (errData?.message) {
    return errData.message;
  }

  return '요청을 처리하는 중 오류가 발생했습니다.';
};
