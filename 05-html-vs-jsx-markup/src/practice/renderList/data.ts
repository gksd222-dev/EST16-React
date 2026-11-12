export interface Song {
  id: string;
  title: string;
  artist: string;
  isLiked: boolean;
}

export interface PlaylistInfo {
  만든이: string;
  장르: string;
  공개여부: string;
  업데이트: string;
}

export interface Playlist {
  id: string;
  title: string;
  tags: string[];
  info: PlaylistInfo;
  songs: Song[];
}

export const playlists: Playlist[] = [
  {
    id: 'P-01',
    title: '코딩할 때 듣는 노래',
    tags: ['집중', 'Lo-fi', '새벽'],
    info: {
      만든이: '야무',
      장르: '로파이',
      공개여부: '공개',
      업데이트: '2026-11-08',
    },
    songs: [
      { id: 's1', title: 'Rainy Commit', artist: 'Lo-fi Cat', isLiked: true },
      { id: 's2', title: 'Merge Conflict', artist: 'Beat Owl', isLiked: false },
      { id: 's3', title: 'useEffect Blues', artist: 'Lo-fi Cat', isLiked: true },
      { id: 's4', title: 'Hot Reload', artist: 'Night Bus', isLiked: false },
    ],
  },
  {
    id: 'P-02',
    title: '아침 출근길',
    tags: ['신남', '출근'],
    info: {
      만든이: '범쌤',
      장르: '팝',
      공개여부: '비공개',
      업데이트: '2026-11-01',
    },
    songs: [
      { id: 's5', title: 'Morning Build', artist: 'Sunny Day', isLiked: false },
      { id: 's6', title: 'Green Light', artist: 'Subway 2', isLiked: false },
    ],
  },
];