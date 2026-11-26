import supabase from "@/supabase/supabase";




export async function getAvatarUrl(userId:string):Promise<string|null> {
  
  const { data:files, error:listError } = await supabase.storage
  .from('avatars')
  .list("",{
    limit: 10,
    search: userId
  })

  if(listError || !files){
    console.error('파일 목록 불러오기 실패:',listError);
    return null;
  }


  const matchedFile = files.find((file)=>
    file.name.startsWith(userId)
  )

  if(!matchedFile){
    console.warn(`userId로 시작하는 이미지가 없습니다: ${userId}`);
    return null;
  }

  
  const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(matchedFile.name)

  return data?.publicUrl || null;

}











