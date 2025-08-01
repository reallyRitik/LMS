import mongoose, {Document,Model,Schema} from "mongoose";

interface IComment extends Document {
  user: object;
    comment: string;
    commentReplies?: IComment[];
}

interface IReview extends Document {
    user:object;
    rating:Number;
    comment:String;
    commentReplies: IComment[];
}
interface ILink extends Document {
    title: string;
    url: string;
}

interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: object;
    videoLength: number;
    videoSection: string;
    videoPlayer: string;
    links: ILink[];
    suggestions: string;
    questions: IComment[];
}

interface ICourse extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: object;
    tags:string;
    level: string;
    demoUrl: string;
    benefits: {title: string}[];
    prerequisites: {title: string}[];
    reviews: IReview[];
    courseData: ICourseData[];
    ratings?: number;
    purchased?:number;
    
}

const reviewSchema = new Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    comment:String,
});
const linkSchema = new Schema<ILink>({
    title: String,
    url: String,
});

const commentSchema = new Schema<IComment>({
    user: Object,
    comment: String,
    commentReplies: [Object],
});

const courseDataSchema = new Schema<ICourseData>({
    videoUrl: String,
    title: String,
    description: String,
    videoSection:String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestions: String,
    questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>({
    name:{
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedPrice: {
        type: Number,
        default: 0,
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        required: true,
    },
    benefits: [{title:String}],
    prerequisites: [{title:String}],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },
})

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;