import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-purple-600 text-white">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-xl font-semibold leading-tight tracking-tight">
                <span className="mb-0.5 truncate leading-tight font-semibold">Kompetensia</span>
            </div>
        </>
    );
}
