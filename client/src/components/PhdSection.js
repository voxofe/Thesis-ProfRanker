import InputField from './InputField';
import Upload from './Upload';
import Checkbox from "./Checkbox";

export default function PersonalInfoSection({formData, onChange, onFileChange, onDelete}){

    const today = new Date().toISOString().split("T")[0];

    return(

        <div className="py-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 border-b border-gray-900/10  ">

            {/* Column 1*/}
            <div className="sm:col-span-1">
                {/* PHD Upload*/}
                <Upload 
                    icon = "document-text"
                    label="Διδακτορικό Δίπλωμα"
                    content="το διδακτορικό σας"
                    id="phd-upload"
                    name="phd-upload"
                    accept=".pdf,.doc,.docx, .odt"
                    uploadedFile={formData.phdDocument}
                    onChange={(e) => onFileChange('phdDocument', e)}
                    onDelete={() => onDelete("phdDocument")}
                    required= {true}  
                /> 
            </div>             

            {/* Column 2*/}
            <div className="sm:col-span-1 ">
                {/* PHD Acquisition Date*/}
                <InputField
                    label="Ημερομηνία λήψης διδακτορικού τίτλου"
                    id="date-field"
                    name="date-field"
                    type="date"
                    max={today}
                    min="2011-01-01"
                    defaultValue={today}
                    value={formData.phdAcquisitionDate}
                    onChange = {(value) => onChange("phdAcquisitionDate", value)}
                    required={true}
                />                
                {/* Foreign Ιnstitute Checkbox*/}
                <Checkbox  className="pt-2"
                    label="Kατοχή τίτλου από Ίδρυμα του εξωτερικού (αναγνωρισμένο από τον ΔΟΑΤΑΠ)"
                    id="foreign-institute"
                    name="foreign-institute"
                    checked={formData.phdIsFromForeignInstitue}
                    onChange={(value) => onChange('phdIsFromForeignInstitue', value)}
                />  
                {/* DOATAP Upload*/}
                <Upload className="pt-[40px]"
                    icon = "document-text"
                    label=""
                    content="το έγγραφο αναγνώρισης από τον ΔΟΑΤΑΠ"
                    id="doatap-upload"
                    name="doatap-upload"
                    accept=".pdf,.doc,.docx, .odt"
                    uploadedFile={formData.doatapDocument}
                    onChange={(e) => onFileChange('doatapDocument', e)}
                    onDelete={() => onDelete("doatapDocument")}
                    disabled={!formData.phdIsFromForeignInstitue}
                    required={formData.phdIsFromForeignInstitue}
                />                   
            </div>
        </div>       
    )
}