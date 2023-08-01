import Image from 'next/image'
import {
    CaretRight,
    ArrowSquareOut,
    TrashSimple, CaretDown, Plus,
} from 'phosphor-react'
import React, {Fragment, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {SERVER_ADDRESS} from "../types/constants";
import kadoaLogo from "../../public/kadoa-logo.svg";
import {Dialog, Transition} from '@headlessui/react'

const extractOptions = [
    'Ask HN: Who is hiring? (July 2023)',
    'Ask HN: Who is hiring? (June 2023)',
]
const types = ['remote', 'on site', 'hybrid']

const faqs = [
    {
        q: 'How does this work?',
        a: (
            <p>
                One of the superpowers of LLMs is reformatting information from any
                format X to any other format Y. We leverage this to map all the
                unstructured job postings into the same unified structure. The new GPT
                functions feature and the extended context windows are really helpful
                for this. Instead of having to build a custom NER pipeline, it works
                very well with GPT out-of-the box.
            </p>
        ),
    },
    {
        q: 'Can I add more sources?',
        a: (
            <p>
                You'll be able to fully customize your job sources soon, including the
                ability to add your preferred companies.
            </p>
        ),
    },
    {
        q: "What's next?",
        a: (
            <p>
                Personalize monitoring for jobs, events, and real estate. Imagine using
                AI to rate local events from multiple sources based on your preferences,
                considering factors like your interests and distance from home.
                <br/>
                Email hello@kadoa.com for feedback.
            </p>
        ),
    },
]

export default function ShowcaseHN() {
    const [location, setLocation] = useState('')
    const [email, setEmail] = useState('')
    const [type, setType] = useState('')
    const [sources, setSources] = useState(['Ask HN: Who is hiring? (July 2023)'])
    const [loading, setLoading] = useState(false)
    const [sortProperty, setSortProperty] = useState(''); // State to manage selected sort property

    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [subscribed, setSubscribed] = useState(false)
    const [jobResults, setJobResults] = useState([])
    const [jobCount, setJobCount] = useState(0)
    const [propertyMode, setPropertyMode] = useState(null)
    const [fields, setFields] = useState([
        {
            name: 'remoteOrOnSite',
            description:
                "",
            criteria: ''
        },
        {
            name: 'location',
            criteria: ''
        },
        {
            name: 'technologies',
            description:
                "",
            criteria: ''
        },
        {
            name: 'industry',
            description:
                "",
            criteria: ''
        },
        {
            name: 'roleType',
            description:
                "",
            criteria: ''
        },
        {
            name: 'salary',
            description:
                "",
            criteria: ''
        },
    ])

    const [selectedProperty, setSelectedProperty] = useState(null)
    const [formData, setFormData] = useState({name: '', description: '', criteria: ''})

    const handleEditClick = (property, index) => {
        setFormData({name: property.name, description: property.description, criteria: property.criteria}) // Populate this with real data
        setSelectedProperty(index)
        setPropertyMode('edit')
    }

    const handleDeleteClick = (index) => {
        const newFields = fields.filter((field, i) => i !== index)
        setFields(newFields)
    }

    const handleSaveChangesClick = (index) => {
        let newFields = [...fields]
        if (propertyMode === 'edit') {
            newFields[index] = formData
        } else if (propertyMode === 'add') {
            newFields.push(formData)
        }
        setFields(newFields)
        setPropertyMode(null)
    }

    const handleCancelClick = () => {
        setPropertyMode(null)
    }

    const handleAddClick = () => {
        setFormData({name: '', description: '', criteria: ''})
        setPropertyMode('add')
    }

    useEffect(() => {
        load()
    }, [])


    const handleSort = (property) => {
        const sortedResults = [...jobResults].sort((a, b) => b.result[property] - a.result[property]);
        setJobResults(sortedResults);
        setSortProperty(property);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitted(true)
        await search()
    }

    const search = async () => {
        setLoading(true)
        setSuccess(false)
        try {
            const res = await axios.post(`${SERVER_ADDRESS}/analyze`, {fields})
            const data = res.data
            setJobResults(data.results.sort((a, b) => b.totalScore - a.totalScore))
            setJobCount(data.results?.length)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const load = async () => {
        setLoading(true)
        setSuccess(false)
        try {
            const res = await axios.get(`${SERVER_ADDRESS}/load`)
            const data = res.data
            setJobResults(data.results.sort((a, b) => b.totalScore - a.totalScore))
            if (data.criteria?.length > 0) {
                setFields(data.criteria);
            }
            setJobCount(data.results?.length)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }


    const getColor = (value) => {
        //value from 0 to 1
        if (value === 0) {
            return "bg-slate-50"
        }
        if (value > 0.0 && value < 0.5) {
            return "bg-teal-50"
        }
        if (value >= 0.5 && value < 1.0) {
            return "bg-emerald-100"
        }
        if (value === 1.0) {
            return "bg-green-400"
        }
    }

    return (
        <div
            className="grid w-full max-w-2xl gap-4 p-2 mx-auto antialiased font-normal leading-relaxed bg-white auto-rows-min scroll-smooth text-slate-800 sm:p-4">
            <div
                className="flex w-full gap-2 bg-white border-2 rounded flex-nowrap place-items-center border-aubergine">
                <div className="flex-1 px-3 py-2 text-2xl font-medium text-aubergine">
                    Who is Hiring?
                </div>
                <div className="flex gap-2 p-2 leading-none text-white shrink-0 place-items-center bg-aubergine">
                    <div className="text-sm font-bold">by</div>
                    <a
                        href="https://kadoa.com"
                        rel="noopener"
                        target="_blank"
                        className="rounded-sm hover:bg-electra/50"
                    >
                        <Image src={kadoaLogo} alt="Kadoa logo" width="101" height="33"/>
                    </a>
                </div>
            </div>
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
            {fields &&
                fields.map((f, i) => (
                    <div key={i}>
                        <div className="flex flex-wrap gap-2">
                            <div
                                className="flex flex-wrap flex-1 gap-2 p-1 pl-4 rounded place-items-center bg-stone-100">
                                <div className="flex-1">{f.name}</div>
                                <div className="font-bold btn-ghost shrink-0">
                                    {f.criteria}
                                    <CaretDown weight="bold" className="text-stone-400"
                                               onClick={() => handleEditClick(f, i)}/>
                                </div>
                            </div>
                            <a href="#" className="btn-outline k-delete shrink-0">
                                <TrashSimple onClick={() => handleDeleteClick(i)} weight="bold" className="text-orange-600"/>
                            </a>
                        </div>
                        <hr/>
                    </div>
                ))}

            <Transition.Root show={propertyMode === "edit" || propertyMode === "add"} as={Fragment}>
                <Dialog as="div" className="relative z-10 font-normal" onClose={() => {
                }}>
                    <Transition.Child
                        as={Fragment}
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto font-sans">
                        <div
                            className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                            >
                                <Dialog.Panel
                                    className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">

                                    <div
                                        className="grid auto-rows-min gap-2 p-2">
                                        <div className="text-xl font-medium">
                                            {propertyMode === 'edit'
                                                ? 'Edit a property'
                                                : 'Add a property'}
                                        </div>
                                        <hr className="my-2 w-full bg-slate-300"/>
                                        <div className="flex w-full gap-2">
                                            <div className="flex-1 text-xs font-medium uppercase">
                                                Name of the property
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="E.g. experience"
                                            value={formData.name}
                                            onChange={(event) =>
                                                setFormData({
                                                    ...formData,
                                                    name: event.target.value,

                                                })
                                            }
                                            className="w-full"
                                        />
                                        <hr className="my-2 w-full bg-slate-300"/>
                                        <div className="flex w-full gap-2">
                                            <div className="flex-1 text-xs font-medium uppercase">
                                                Value of the property
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="E.g. embedded systems"
                                            value={formData.criteria}
                                            onChange={(event) =>
                                                setFormData({
                                                    ...formData,
                                                    criteria: event.target.value,
                                                })
                                            }
                                            className="w-full"
                                        />
                                        <hr className="my-2 w-full bg-slate-300"/>
                                        <div className="flex w-full gap-1">
                                            <button
                                                onClick={() => handleSaveChangesClick(selectedProperty)}
                                                className="btn-primary flex-1 !p-2 !text-sm font-medium"
                                            >
                                                Save changes
                                            </button>
                                            <button
                                                onClick={handleCancelClick}
                                                className="btn-outline flex-1 !p-2 !text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/*<!-- spacer: mobile  -->*/}
            <div className="relative flex flex-wrap gap-4 pl-10">
                <div className="absolute top-0 left-0 p-2">
                    <Plus weight="bold" className="text-stone-400"/>
                </div>
                {/* dropdown TODO replace with variables*/}
                <button className="relative cursor-pointer btn-ghost" onClick={() => {
                    setPropertyMode("add")
                    setFormData({
                        ...formData,
                        name: "Position",

                    })
                }}>
                    Position
                    <CaretDown weight="bold" className="text-stone-400"/>
                </button>
                <div className="relative cursor-pointer btn-ghost">
                    Relocation
                    <CaretDown weight="bold" className="text-stone-400"/>
                </div>
                <div className="relative cursor-pointer btn-ghost">
                    Industry
                    <CaretDown weight="bold" className="text-stone-400"/>
                </div>
                <div className="relative cursor-pointer btn-ghost">
                    Visa
                    <CaretDown weight="bold" className="text-stone-400"/>
                </div>
                <div className="relative cursor-pointer btn-ghost">
                    Salary
                    <CaretDown weight="bold" className="text-stone-400"/>
                </div>
                <div className="relative cursor-pointer btn-ghost">
                    Add an arbitrary property
                    <CaretDown weight="bold" className="text-stone-400"/>
                </div>
            </div>
            <button disabled={loading}
                    onClick={handleSubmit}
                    type="submit" className="btn-primary !p-3 text-xl !font-medium">
                Analyze jobs
            </button>
            <hr/>
            <h3 className="text-xl font-medium">{jobCount} jobs found</h3>
            {/*<!-- block: ready to try? -->*/}
            <div className="">
                <div className="">
                    {loading && <p className="text-center">Searching...</p>}
                    {jobResults?.length > 0 && !loading && (
                        <ul
                            role="list"
                            className="space-y-2"
                        >
                            {jobResults.map((job) => (
                                <li
                                    key={job._id}
                                    className="flex items-start max-w-full gap-2 px-4 py-3 overflow-x-auto border-2 rounded cursor-pointer flex-nowrap border-aubergine hover:bg-stone-100"
                                >
                                    <div
                                        className="flex-1"
                                        dangerouslySetInnerHTML={{
                                            __html: job.text,
                                        }}
                                    />
                                    <a
                                        target="_blank"
                                        href={
                                            'https://news.ycombinator.com/item?id=' +
                                            job.hnId
                                        }
                                    >
                                        <ArrowSquareOut weight="bold"/>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                    {jobResults?.length === 0 && loading === false && submitted && (
                        <p className="text-center">No results</p>
                    )}
                </div>
            </div>
            {/*<!-- block: q&a -->*/}
            <div className="px-4 py-12  lg:p-12">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 bg-white ">
                    <div className="w-full text-center text-3xl font-medium lg:text-5xl">
                        q&amp;a
                    </div>
                    {faqs.map((faq, key) => (
                        <div className="grid gap-4 lg:flex lg:gap-24" key={key}>
                            <div className="w-full max-w-xs flex-none text-lg font-medium text-electra">
                                {faq.q}
                            </div>
                            <div className="flex-1">{faq.a}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
