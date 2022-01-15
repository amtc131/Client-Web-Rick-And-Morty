import { Location } from "./Location";
import { Origin } from "./Origin";

export interface Character {
    id: Number;
    name: string;
    status: string;
    species: string;
    type: string;
    gender: string,
    origin: Origin;
    location: Location;
    image: string;
    episode: Array<any>;
    url: string;
    created: string;
}