/**
 * 폼 입력 사전 유효성 검증 유틸리티
 */

// 이메일 정규식 (standard RFC 5322 compatible pattern)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return '이메일을 입력해 주세요.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return '올바른 이메일 형식(예: name@domain.com)이어야 합니다.';
  }
  return null;
};

export const validatePassword = (password: string, minLength = 6): string | null => {
  if (!password || password.trim() === '') {
    return '비밀번호를 입력해 주세요.';
  }
  if (password.length < minLength) {
    return `비밀번호는 최소 ${minLength}자 이상이어야 합니다.`;
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return '비밀번호 확인을 입력해 주세요.';
  }
  if (password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.';
  }
  return null;
};

export const validateNickname = (nickname: string): string | null => {
  if (!nickname || nickname.trim() === '') {
    return '닉네임을 입력해 주세요.';
  }
  if (nickname.trim().length > 20) {
    return '닉네임은 최대 20자까지 가능합니다.';
  }
  return null;
};
