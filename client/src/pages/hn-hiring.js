import { CaretDown, TrashSimple, Plus, ArrowSquareOut } from 'phosphor-react'
import kadoaLogo from '../../public/kadoa-logo.svg'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="grid w-full max-w-2xl gap-4 p-2 mx-auto antialiased font-normal leading-relaxed bg-white auto-rows-min scroll-smooth text-slate-800 sm:p-4">
      {/* header */}
      <div className="flex w-full gap-2 bg-white border-2 rounded flex-nowrap place-items-center border-aubergine">
        <div className="flex-1 px-3 py-2 text-2xl font-medium text-aubergine">
          Who is Hiring?
        </div>
        <div className="flex gap-2 p-2 leading-none text-white shrink-0 place-items-center bg-aubergine">
          <div className="text-sm font-bold">by</div>
          <a
            href="https://kadoa.com"
            target="_blank"
            className="rounded-sm hover:bg-electra/50"
          >
            <Image src={kadoaLogo} alt="Kadoa logo" width="101" height="33" />
          </a>
        </div>
      </div>
      {/* teaser */}
      <div className="">
        Looking for an IT job? Save time and use{' '}
        <a
          href=""
          className="underline decoration-aubergine/50 hover:bg-sunflower"
        >
          Kadoa
        </a>
        's AI-powered tool to search{' '}
        <a
          href="https://news.ycombinator.com/"
          target="_blank"
          className="underline decoration-aubergine/50 hover:bg-sunflower"
        >
          Hacker News'
        </a>
        "Who's Hiring" monthly threads.
      </div>
      <div className="">
        To start, select a suggested property or add an arbitrary property.
      </div>
      <hr />
      {/* added property */}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap flex-1 gap-2 p-1 pl-4 rounded place-items-center bg-stone-100">
          <div className="flex-1">Remote or on site</div>
          <div className="font-bold btn-ghost shrink-0">
            Remote
            <CaretDown weight="bold" className="text-stone-400" />
          </div>
        </div>
        <a href="#" className="btn-outline k-delete shrink-0">
          <TrashSimple weight="bold" className="text-orange-600" />
        </a>
      </div>
      <hr />
      {/* add more properties */}
      <div className="relative flex flex-wrap gap-4 pl-10">
        <div className="absolute top-0 left-0 p-2">
          <Plus weight="bold" className="text-stone-400" />
        </div>
        {/* dropdown */}
        <div className="relative cursor-pointer btn-ghost">
          Position
          <CaretDown weight="bold" className="text-stone-400" />
          <div className="k-dropdown group absolute left-0 top-full z-50 grid min-w-[200px] auto-rows-min gap-2 rounded border-2 border-aubergine bg-stone-100 p-2">
            <a href="" className="btn-ghost w-full !justify-start">
              Developer
            </a>
            <a href="" className="btn-ghost w-full !justify-start">
              Designer
            </a>
            <a href="" className="btn-ghost w-full !justify-start">
              Sales
            </a>
            <input type="text" className="w-full" placeholder="Custom value" />
            <div className="hidden group-focus-within:flex">
              <button className="w-full btn-primary">Add</button>
            </div>
          </div>
        </div>
        <div className="relative cursor-pointer btn-ghost">
          Relocation
          <CaretDown weight="bold" className="text-stone-400" />
        </div>
        <div className="relative cursor-pointer btn-ghost">
          Industry
          <CaretDown weight="bold" className="text-stone-400" />
        </div>
        <div className="relative cursor-pointer btn-ghost">
          Visa
          <CaretDown weight="bold" className="text-stone-400" />
        </div>
        <div className="relative cursor-pointer btn-ghost">
          Schedule
          <CaretDown weight="bold" className="text-stone-400" />
        </div>
        <div className="relative cursor-pointer btn-ghost">
          Salary range
          <CaretDown weight="bold" className="text-stone-400" />
        </div>
        <div className="relative cursor-pointer btn-ghost">
          Equity
          <CaretDown weight="bold" className="text-stone-400" />
        </div>
        <div className="relative cursor-pointer btn-ghost">
          Add an arbitrary property
          <CaretDown weight="bold" className="text-stone-400" />
          <div className="k-dropdown group absolute left-0 top-full z-50 grid hidden min-w-[200px] auto-rows-min gap-2 rounded border-2 border-aubergine bg-stone-100 p-2">
            Name of the property
            <input
              type="text"
              className="w-full"
              placeholder="E.g. experience"
            />
            <hr />
            Value of the property
            <input
              type="text"
              className="w-full"
              placeholder="E.g. embedded systems"
            />
            <button className="w-full btn-primary">Add</button>
          </div>
        </div>
      </div>
      <hr />
      <button href="#" className="btn-primary !p-3 text-xl !font-medium">
        Analyze jobs
      </button>
      <hr />
      <h3 className="text-xl font-medium">Found 3 matching jobs</h3>
      {/* result */}
      <a
        href="#"
        target="_blank"
        className="flex items-start max-w-full gap-2 px-4 py-3 overflow-x-auto border-2 rounded cursor-pointer flex-nowrap border-aubergine hover:bg-stone-100"
      >
        <div className="flex-1">
          FlightAware | multiple roles | REMOTE (US timezones) | Houston / US |
          https://flightaware.com/about/careers/
          <br />
          Hello from FlightAware! We are hiring for a Network Reliability
          Engineer to help create, automate, and manage both on-prem and cloud
          networks. Our team is headquartered in Houston, Texas, but we work as
          a distributed team and accept remote applicants for work within the
          United States.
          <br />
          <br />
          FlightAware has built the world’s leading aviation software platform,
          processing over 180 million incoming messages an hour from over 30,000
          feeds—over 2TB a day and growing—to provide the best, most complete,
          and most accurate real-time flight tracking services in the industry.
          We use Python, Rust, C++, Tcl, and JavaScript. We are proud to have
          built a wide variety of successful products on this foundation that
          have become central to the aviation industry at large.
        </div>
        <ArrowSquareOut weight="bold" />
      </a>
    </div>
  )
}
