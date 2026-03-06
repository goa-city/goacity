import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32 min-h-screen flex items-center">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl"> Goa City Movement </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        Connecting the Kingdom. United in Purpose.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            to="/"
                            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                            Member Login
                        </Link>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
