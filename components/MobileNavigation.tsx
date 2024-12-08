'use client';
import React, { useState } from 'react'
import { navItems } from '@/constants'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

import { signOutUser } from '@/lib/actions/user.actions'
import Image from 'next/image'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import FileUploader from './FileUploader';

interface Props{
  ownerId:string;
  accountId:string;
  fullName:string;
  avatar:string;
  email:string;
}

const MobileNavigation = ({ownerId, accountId, fullName, avatar, email}:Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
<header className='mobile-header'>
  <Image src="/assets/icons/logo-full-brand.svg" alt="logo" width={120} height={52} className='h-auto'/>
  <Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger>
    <Image src="/assets/icons/menu.svg" alt="search" width={30} height={30} className='h-auto'/>
  </SheetTrigger>
  <SheetContent className='shad-sheet h-screen px-3'>
      <SheetTitle className='header-user'>
      <Image src={avatar} alt="avatar" width={44} height={44} className='header-user-avatar' />
      <div className='sm:hidden lg:block'>
        <p className="subtitle-2 capitalize">{fullName}</p>
        <p className="caption">{email}</p>

      </div>
        </SheetTitle>
        <Separator className='mb-4 bg-light-200/20'/>
      <nav className="mobile-nav">
        <ul className="mobile-nav-list">
        {navItems.map(({url, name, icon}) =>(
            <Link key={name} href={url} className='lg:w-full'>
              <li className={cn('mobile-nav-item', pathname===url && 'shad-active')}>
                <Image src={icon} alt={name} width={24} height={24} className={cn('nav-icon', pathname === url && 'nav-icon-active')}/>
                <p >{name}</p>
              </li>
            </Link>
            ))};
        </ul>
      </nav>
      <Separator className='my-5 bg-light-200/20'/>
      <div className='flex flex-col justifiy-between gap-5 pb-5'>
        <FileUploader/>

        <Button type='submit' className='mobile-sign-out-button' onClick={async () => await signOutUser()}
        >
            <Image src='/assets/icons/logout.svg' alt='Logout' width={24} height={24}/>
            <p>Logout</p>
        </Button>
      </div>
  </SheetContent>
</Sheet>

</header>
  )
}

export default MobileNavigation