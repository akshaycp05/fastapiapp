import type {Company} from "../types/company";
import { getCompany} from "../Services/CompanyService";
import {useState} from "react";

type Props = {
    companies:Company[];
    onedit: (company:Company)=>void;
    ondelete: (id:number)=>void;
    onadd: (company:Company)=>void;
}


function CompanyCard({
    companies,onadd,onedit,ondelete}:Props){
    const [editCompanyId, setEditCompanyId] = useState<number | null>(null);
    const [editcompany, setEditcompany] = useState<Company | null>(null);
    void editcompany;
    void setEditcompany;
    const [addform,setAddform] = useState<Company>({
        id:0,
        name:"",
        email:"",
        phone:"",
        location:"",
        address: "",
        jobs:[]
    });
    const [editform,setEditform] = useState<Company>({
        id:0,
        name:"",
        email:"",
        phone:"",
        location:"",
        address: "",
        jobs:[]
    });
    const handleAdd = () => {
        onadd(addform);
        setAddform({
            id:0,
            name:"",
            email:"",
            phone:"",
            location:"",
            address: "",
            jobs:[]
        })
    }
    const handleEdit = async (company:Company) => {
        const freshCompany = await getCompany(company.id);
        setEditcompany(freshCompany);
        setEditCompanyId(company.id);
        setEditform({
            id:freshCompany.id,
            name:freshCompany.name,
            email:freshCompany.email,
            phone:freshCompany.phone,
            location:freshCompany.location,
            address: freshCompany.address,
            jobs:freshCompany.jobs
        })
    }
    const handleDelete = (id:number) => {
        ondelete(id);
    }
    const handleSave = (id:number) => {
        onedit({...editform, id});
        setEditcompany(editform);
        setEditCompanyId(null);
        setEditform({
            id:0,
            name:"",
            email:"",
            phone:"",
            location:"",
            address: "",
            jobs:[]
        })
    } 
    const handlecancel = () => {
        setEditCompanyId(null);
        setEditform({
            id:0,
            name:"",
            email:"",
            phone:"",
            location:"",
            address: "",
            jobs:[]
        })
    } 

    return(
        <div>
            {companies.map((company) => (
                <div key={company.id}>
                    {editCompanyId === company.id ? (
                        <>
                    <input type="text" value={editform.name} onChange={(e)=>setEditform({...editform,name:e.target.value})} placeholder={company.name} />
                    <input type="text" value={editform.email} onChange={(e)=>setEditform({...editform,email:e.target.value})} placeholder={company.email} />
                    <input type="text" value={editform.phone} onChange={(e)=>setEditform({...editform,phone:e.target.value})} placeholder={company.phone} />
                    <input type="text" value={editform.location} onChange={(e)=>setEditform({...editform,location:e.target.value})} placeholder={company.location} />
                    <button onClick={() => handleSave(company.id)}>Save</button>
                    <button onClick={handlecancel}>Cancel</button>
                    </>
                    ):
                    <>
                    <h1>{company.name}</h1>
                    <p>Email: {company.email}</p>
                    <p>Phone: {company.phone}</p>
                    <p>Location: {company.location}</p>
                    </>}
                    <button onClick={() => handleEdit(company)}>Edit</button>
                    <button onClick={() => handleDelete(company.id)}>Delete</button>
                    <hr></hr>
                </div>
            ))}
            <h2>Add Company</h2>
            <input type="text" value={addform.name} onChange={(e)=>setAddform({...addform,name:e.target.value})} />
            <input type="text" value={addform.email} onChange={(e)=>setAddform({...addform,email:e.target.value})} />
            <input type="text" value={addform.phone} onChange={(e)=>setAddform({...addform,phone:e.target.value})} />
            <input type="text" value={addform.location} onChange={(e)=>setAddform({...addform,location:e.target.value})} />
            <button onClick={handleAdd}>Add</button>
        </div>
    )
}

export default CompanyCard