import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import catchAsyncError from "../middleware/catchAsyncErrors";
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
// upload course

export const uploadCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      await createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler("Error uploading course", 500));
    }
  }
);

// Edit course

export const editCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const data = req.body;

      // Handle thumbnail update if provided
      if (data.thumbnail) {
        // Destroy old thumbnail if public_id is provided
        if (data.thumbnail.public_id) {
          await cloudinary.v2.uploader.destroy(data.thumbnail.public_id);
        }
        // Upload new thumbnail
        const myCloud = await cloudinary.v2.uploader.upload(data.thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      // Update course document
      const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, { $set: data }, {
        new: true,
        runValidators: true,
      });

      if (!updatedCourse) {
        return next(new ErrorHandler("Course not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error: any) {
      return next(new ErrorHandler("Error editing course", 500));
    }
  }
);

// get single course - without purchasing

export const getSingleCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    
    try {

      const courseId = req.params.id;
      const isCacheExit = await redis.get(courseId);
      // Check if course is cached in Redis
      
      if (isCacheExit) {
        const course = JSON.parse(isCacheExit);
        return res.status(200).json({
          success: true,
          course,
        });
      }
       else{
         const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
         await redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
            success: true,
            course,
        })
       }
    }
    catch (error: any) {
      return next(new ErrorHandler("Error fetching course", 500));
    }
  });

  //get all courses - without purchasing

export const getAllCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use a static cache key for all courses
      const cacheKey = "all_courses";
      const isCacheExist = await redis.get(cacheKey);
      if (isCacheExist) {
        const courses = JSON.parse(isCacheExist);
        return res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        await redis.set(cacheKey, JSON.stringify(courses));
        return res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler("Error fetching courses", 500));
    }
  }
);