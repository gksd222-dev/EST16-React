import reactLogo from '@/assets/react.svg';

export interface Profile {
  name: string;
  nickname: string;
  birthYear: number;
  avatar: string;
  github: string;
  themeColor: string;
  job: {
    title: string;
    company: string;
  };
  skills: string[];
  isOpenToWork: boolean;
}

export const profile: Profile = {
  name: '안경찬',
  nickname: 'react-an',
  birthYear: 2000,
  avatar: reactLogo,
  github: 'https://github.com/facebook/react',
  themeColor: '#61dafb',
  job: {
    title: '프론트엔드 개발자',
    company: '이스트소프트',
  },
  skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React'],
  isOpenToWork: true,
};

export const todayQuotes: string[] = [
  '🌱 오늘도 한 줄씩 성장 중',
  '🔥 버그는 친구다',
  '☕️ 커피 수혈 완료',
  '🚀 배포는 금요일에 하지 않는다',
];