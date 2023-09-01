import Image from 'next/image'
import {
    TrashSimple, CaretDown, Plus, PencilSimple,
} from 'phosphor-react'
import React, {Fragment, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {SERVER_ADDRESS} from "../types/constants";
import kadoaLogo from "../../public/kadoa-logo.svg";
import {Dialog, Transition} from '@headlessui/react'

const suggestions = ['Industry', 'Visa Sponsorship', 'Salary']

export default function ShowcaseHN() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [jobResults, setJobResults] = useState([])
    const [jobCount, setJobCount] = useState(0)
    const [propertyMode, setPropertyMode] = useState(null)
    const [fields, setFields] = useState([
        {
            name: 'location',
            description:
                "",
            criteria: 'on-site in San Francisco or remote in the US',
            type: 'must'
        },
        {
            name: 'technology stack',
            description:
                "",
            criteria: "Python, React, GraphQL, Docker, Kubernetes",
            type: "",
        },
        {
            name: 'industry',
            description:
                "",
            criteria: 'FinTech',
            type: "",
        },
        {
            name: 'salary',
            description:
                "",
            criteria: '150k plus',
            type: "",
        },
    ])

    const [selectedProperty, setSelectedProperty] = useState(null)
    const [formData, setFormData] = useState({name: '', description: '', type: '', criteria: ''})

    const handleEditClick = (property, index) => {
        setFormData({
            name: property.name,
            description: property.description,
            type: property.type,
            criteria: property.criteria
        }) // Populate this with real data
        setSelectedProperty(index)
        setPropertyMode('edit')
    }

    const handleDeleteClick = (event, index) => {
        event.preventDefault();
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
        setFormData({name: '', description: '', criteria: '', type: ''})
    }

    const handleCancelClick = () => {
        setPropertyMode(null)
    }

    useEffect(() => {
        load()
    }, [])

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
            setJobResults(data.results.sort((a, b) => b.relevanceScore - a.relevanceScore))
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
            if (data.results?.length > 0) {
                setJobResults(data.results.sort((a, b) => b.relevanceScore - a.relevanceScore));
            }
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

    return (
        <div
            className="grid w-full max-w-2xl gap-4 p-2 mx-auto antialiased font-normal leading-relaxed bg-white auto-rows-min scroll-smooth text-slate-800 sm:p-4">
            <div
                className="flex w-full gap-2 bg-white border-2 rounded flex-nowrap place-items-center border-aubergine">
                <div className="flex-1 px-3 py-2 text-2xl font-medium text-aubergine">
                    Datalens
                </div>
            </div>
            <div className="">
                This is a personal experiment that uses LLMs to rank unstructured job data based on user-defined
                criteria.
                Traditional job search platforms rely on rigid filtering systems, but many users lack such concrete
                criteria.
                Datalens lets you define your preferences in a more natural way and then rates each job postings based
                on the relevance.
                <br/><br/>
                Some criteria might be more important than others, so "must criteria" are weighted twice as much as
                normal ones.
            </div>
            <hr/>
            {fields &&
                fields.map((f, i) => (
                    <div key={i} className="grid gap-4">
                        <div key={i} className="flex flex-wrap gap-2">
                            <div
                                className="flex flex-wrap flex-1 px-4 py-2 rounded place-items-center bg-stone-100">
                                <div className="flex-1">{f.name}</div>
                                <div className="font-medium shrink-0">
                                    {f.criteria}
                                </div>
                            </div>
                            <button onClick={() => handleEditClick(f, i)} className="btn-outline shrink-0">
                                <PencilSimple weight="bold"/>
                            </button>
                            <button className="btn-outline k-delete shrink-0"
                                    onClick={(event) => handleDeleteClick(event, i)}>
                                <TrashSimple weight="bold"
                                             className="text-orange-600"/>
                            </button>
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
                                            <div className="flex-1 font-medium">
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
                                            <div className="flex-1 font-medium">
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
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.type === 'must'}
                                                onChange={(event) =>
                                                    setFormData({
                                                        ...formData,
                                                        type: event.target.checked ? 'must' : '',
                                                    })
                                                }
                                                className="mr-2"
                                            />
                                            <div className="font-medium">
                                                Mark as must criteria
                                            </div>
                                        </div>
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
                {suggestions.map((s, i) => (
                    <button key={i} className="relative cursor-pointer btn-ghost" onClick={() => {
                        setPropertyMode("add")
                        setFormData({
                            ...formData,
                            name: s,

                        })
                    }}>
                        {s}
                    </button>
                ))}
                <button className="relative cursor-pointer btn-ghost" onClick={() => {
                    setPropertyMode("add")
                    setFormData({
                        ...formData,
                        name: "",

                    })
                }}>
                    Any property
                </button>
            </div>
            <button disabled={loading}
                    onClick={handleSubmit}
                    type="submit" className="btn-primary !p-3 text-xl !font-medium">
                Analyze jobs
            </button>
            <hr/>
            {!loading && (<h3 className="text-xl font-medium">{jobCount} jobs found</h3>)}
            {/*<!-- block: ready to try? -->*/}
            <div className="">
                <div className="">
                    {loading && <p className="text-center">Searching...<br/> Note: this can a few minutes...</p>}
                    {jobResults?.length > 0 && !loading && (
                        <ul
                            role="list"
                            className="space-y-2"
                        >
                            {jobResults.map((job) => (
                                <li
                                    key={job._id}
                                    className="flex flex-col items-start max-w-full gap-2 px-4 py-3 overflow-x-auto border-2 rounded cursor-pointer flex-nowrap border-aubergine hover:bg-stone-100"
                                >
                                    <div className="flex space-x-1">
                                        <span
                                            className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
        relevance: {job.relevanceScore.toFixed(2)}
      </span>
                                        {Object.entries(job.result).map(([key, value]) => (
                                            <span
                                                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
        {key}: {value}
      </span>
                                        ))}
                                    </div>
                                    <div
                                        className="flex-1"
                                        dangerouslySetInnerHTML={{
                                            __html: job.text,
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                    {jobResults?.length === 0 && loading === false && submitted && (
                        <p className="text-center">No results</p>
                    )}
                </div>
            </div>
        </div>
    )
}
