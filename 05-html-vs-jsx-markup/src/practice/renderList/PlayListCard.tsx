import './PlayListCard.css';
import { Fragment, type JSX } from 'react';
import type { Playlist, Song } from './data';

interface Props {
  playlist: Playlist;
}

function PlaylistCard({ playlist }: Props): JSX.Element {

  
  
  const { title, tags, info, songs } = playlist;

  // TODO 1. for...of 문 + push

  const tagItems: JSX.Element[] = [];

  for( const tag of tags ){
    tagItems.push(
      <li key={tag} className='tag'>#{tag}</li>
    );
  }  
  

  // TODO 2. 렌더 함수 만들기
  

  /* template */
  const renderSongItem = ({id, title, artist, isLiked}:Song) => (
      <li key={id}>
        <span className='songTitle'>{title}</span>
        <span className='artist'>{artist}</span>
        {isLiked && <span aria-label="좋아요">❤️</span>}
      </li>
    )


  // TODO 3. filter
  //         songs 중 isLiked 가 true 인 곡만 골라 likedSongs 에 담으세요.
  const likedSongs = songs.filter((song)=> song.isLiked);


  return (
    <article className="playlistCard">
      <h2>{title}</h2>

      {/* TODO 1 에서 만든 tagItems 를 <ul> 안에 넣으세요. */}
      <ul className="tags">
        { tagItems }
      </ul>

      {/* TODO 4. Object.entries + map */}
      <dl className="info">
        {
          Object.entries(info).map(([key, value])=>(
            <Fragment key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </Fragment>
          ))
        }
      </dl>

      {/* songs.length 로 곡 수를 출력하세요. */}
      <h3>전체 곡 ({songs.length})</h3>
      {/* TODO 2 의 renderSongItem 과 map 을 사용해 전체 곡을 렌더링하세요. */}
      <ol className="songs">
        { songs.map(renderSongItem) }
      </ol>

      <h3>최근 추가 순</h3>
      {/* TODO 5. 전체 곡을 역순으로 렌더링하세요.*/}
      <ol className="songs">
        { songs.toReversed().map(renderSongItem) }
      </ol>

      <h3>좋아요한 곡 ({likedSongs.length})</h3>
      {/* TODO 6. 빈 목록 처리 리스트 랜더링 + 조건부 랜더링 */}
      {
        likedSongs.length > 0 ? 
        (<ul className="songs"> {likedSongs.map(renderSongItem)} </ul>) : 
        (<p className='empty'>좋아요를 누른 곡이 없습니다.</p>)
      }
      
    </article>
  );
}

export default PlaylistCard;