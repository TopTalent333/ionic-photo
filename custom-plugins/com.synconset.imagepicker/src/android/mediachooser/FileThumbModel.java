package mediachooser;

import android.os.Parcel;
import android.os.Parcelable;

/**
 * Created by Bryan on 19/02/16.
 */
public class FileThumbModel implements Parcelable{
    public String original;
    public String thumb;
    public Integer rotation;

    public FileThumbModel(){
        super();
    }

    public FileThumbModel(Parcel in){
        super();
        readFromParcel(in);
    }

    public static final Parcelable.Creator<FileThumbModel> CREATOR = new Parcelable.Creator<FileThumbModel>(){

        @Override
        public FileThumbModel createFromParcel(Parcel source) {
            return new FileThumbModel(source);
        }

        @Override
        public FileThumbModel[] newArray(int size) {
            return new FileThumbModel[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    public void readFromParcel(Parcel in){
        original = in.readString();
        thumb = in.readString();
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(original);
        dest.writeString(thumb);
    }
}