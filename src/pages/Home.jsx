import BasicTextField from "../components/BasicTextField"
import BasicButton from "../components/BasicButton";
import {useName} from '../context/NameContext.jsx'


export default function Home(){
    const {updateName} = useName();

    const handleSubmit = (e) => {
        e.preventDefault();
        const newName = document.getElementById("namefield").value;
        updateName(newName);    
    }

    return (
    <section>
    <h2>Update Header</h2>
    <div id="homepage">
    <form onSubmit={handleSubmit}>
    <BasicTextField id={"namefield"}/>
    <BasicButton type={"submit"} />
    </form>
    </div>
    </section>
    );
}