export const statusMessage:StateMessage[] = [
  '⌛️ 대기',
  '⏳ 로딩 중...',
  '✅ 로딩 성공!',
  '❌ 로딩 실패.',
]
export const IMAGE_TYPES:ImageType[] = [
  'react',
  'vite',
  'next.js',
  'kakao talk'
]
export const imageType:ImageType = 'next.js';

export const isShowReactImage: boolean = true;

export const reactLibrary:ReactLibrary = {
  name: 'React',
  author: '조던 워케(Jordan Walke)',
  writtenIn: 'JavaScript',
  type: 'JavaScript 라이브러리',
  license: 'MIT',
};

export const statusMessagesWithID:StatusMessageObject[] = [
  { id: 'message-xyz', message: '⌛️ 대기' },
  { id: 'message-air', message: '⏳ 로딩 중...' },
  { id: 'message-ckd', message: '✅ 로딩 성공!' },
  { id: 'message-eiu', message: '❌ 로딩 실패.' },
];