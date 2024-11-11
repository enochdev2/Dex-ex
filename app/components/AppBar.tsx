"use client"

import Image from 'next/image'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'

export default function AppBar() {
    return (
        <div className="h-[90px] flex bg-black flex-row items-center justify-between text-5xl text-white px-5 flex-wrap">
            <Image src="/solanaLogo.png" height={30} width={200} alt={''} />
            <div className='flex gap-5'>

            <Link className='text-2xl font-bold ' href='/'>
            Home
            </Link>
            <Link  className='text-2xl font-bold ' href='/transfer'>
            Transfer
            </Link>
            <Link className='text-2xl font-bold ' href='/admin'>
            admin
            </Link>
            <Link className='text-2xl font-bold ' href='/'>
            about
            </Link>
            </div>
            <WalletMultiButton />
        </div>
    )
}