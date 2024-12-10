import React from 'react'
import Sort from '@/components/Sort';
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { Models } from 'node-appwrite';
import Card from '@/components/Card';
import { getFileTypesParams,convertFileSize, getUsageSummary } from "@/lib/utils";


const page = async ({searchParams, params}: SearchParamProps) => {
  const type = ((await params)?.type as string  )|| "";

  const capitalizeFirstLetter = (val:string) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
const pageType = capitalizeFirstLetter(type);
  const searchText = ((await searchParams)?.query as string) || ''
  const sort = ((await searchParams)?.sort as string) || ''


  const types = getFileTypesParams( type ) as FileType[];

  const [files, totalSpace] = await Promise.all([
    await getFiles( { types, searchText, sort }),
    getTotalSpaceUsed(),
  ]);
  const usageSummary = getUsageSummary(totalSpace);
  return (
    <div className='page-container'>
    <section className='w-full'>
      <h1 className='h1 capitalize'>{type}</h1>
      <div className='total-size-section'>
        <p className='body-1'>Total: 
          <span className='h5'>{convertFileSize(usageSummary.filter(f => f.title === pageType)[0].size)}</span></p>
          <div className='sort-container'>
        <p className='body-1 hidden sm:block text-light-200'> Sort by:</p>
        <Sort/>
      </div>
      </div>

    </section>
    {files.total > 0 ? (
      <section className='file-list'>
        {files.documents.map((file: Models.Document) => (
          <Card key={file.$id} file={file}/>
    ))}
      </section>
    ): <p className='empty-list'>No files uploaded !</p>}
  </div>
  )
}

export default page