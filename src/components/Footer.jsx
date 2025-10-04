export default function Footer(){
    let date = new Date();
    let year = date.getFullYear();
    return(
    <>
    <footer>
        <p>&copy; {year} CodeCraft Labs. All rights reserved.</p>
    </footer>
    </>);
}